import {
    AttachmentBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    User,
    VoiceChannel,
} from 'discord.js';

import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkFes, getSchedule, getRegularData, MatchInfo } from '../../../common/apis/splatoon3.ink/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { searchChannelIdByName } from '../../../common/manager/channel_manager';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { recruitRegularCanvas, ruleRegularCanvas } from '../../canvases/regular_canvas';
import { sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function regularRecruit(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    assertExistCheck(interaction.channel, 'channel');

    const options = interaction.options;
    const guild = await getGuildByInteraction(interaction);
    const hostMember = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(hostMember, 'hostMember');
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const recruitNum = options.getInteger('募集人数', true);
    let condition = options.getString('参加条件');
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    const user3 = options.getUser('参加者3');
    let memberCounter = recruitNum; // プレイ人数のカウンター
    let type = 0;

    if (options.getSubcommand() === 'now') {
        type = 0;
    } else if (options.getSubcommand() === 'next') {
        type = 1;
    }

    if (recruitNum < 1 || recruitNum > 7) {
        await interaction.reply({
            content: '募集人数は1～7までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (exists(user1)) memberCounter++;
    if (exists(user2)) memberCounter++;
    if (exists(user3)) memberCounter++;

    if (memberCounter > 8) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    const availableChannel = [
        'alfa',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'fox',
        'golf',
        'hotel',
        'india',
        'juliett',
        'kilo',
        'lima',
        'mike',
    ];

    if (voiceChannel instanceof VoiceChannel) {
        if (voiceChannel.members.size != 0 && !voiceChannel.members.has(hostMember.user.id)) {
            await interaction.reply({
                content: 'そのチャンネルは使用中でし！',
                ephemeral: true,
            });
            return;
        } else if (!availableChannel.includes(voiceChannel.name)) {
            await interaction.reply({
                content: 'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！',
                ephemeral: true,
            });
            return;
        }
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    try {
        const schedule = await getSchedule();

        if (notExists(schedule)) {
            return await interaction.editReply({
                content: 'スケジュールの取得に失敗したでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            });
        }

        if (checkFes(schedule, type)) {
            const fesChannelId = await searchChannelIdByName(guild, 'フェス募集', ChannelType.GuildText, null);
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！<#${fesChannelId}>のチャンネルを使うでし！`,
            });
            return;
        }

        const regularData = await getRegularData(schedule, type);

        let txt = `### <@${hostMember.user.id}>` + 'たんのナワバリ募集\n';
        const members: string[] = [];

        if (exists(user1)) {
            members.push(`<@${user1.id}>` + 'たん');
        }
        if (exists(user2)) {
            members.push(`<@${user2.id}>` + 'たん');
        }
        if (exists(user3)) {
            members.push(`<@${user3.id}>` + 'たん');
        }

        if (members.length !== 0) {
            for (const i in members) {
                if (parseInt(i) === 0) {
                    txt = txt + members[i];
                } else {
                    txt = txt + 'と' + members[i];
                }
            }
            txt += 'の参加が既に決定しているでし！\n';
        }

        txt += 'よければ合流しませんか？';

        if (notExists(condition)) condition = 'なし';

        if (notExists(regularData)) {
            await interaction.editReply({
                content: 'レギュラーマッチの情報が取得できなかったでし！',
            });
            return;
        }

        await sendRegularMatch(interaction, txt, recruitNum, condition, memberCounter, hostMember, user1, user2, user3, regularData);
    } catch (error) {
        if (exists(channel)) {
            await channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendRegularMatch(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
    user3: User | null,
    regularData: MatchInfo,
) {
    const reservedChannel = interaction.options.getChannel('使用チャンネル');
    let channelName = null;
    if (exists(reservedChannel)) {
        channelName = reservedChannel.name;
    }

    assertExistCheck(interaction.channel, 'channel');

    const guild = await getGuildByInteraction(interaction);

    const recruiter = await searchDBMemberById(guild, hostMember.id);
    assertExistCheck(recruiter, 'recruiter');

    let attendee1 = null;
    let attendee2 = null;
    let attendee3 = null;

    if (exists(user1)) {
        attendee1 = await searchDBMemberById(guild, user1.id);
        assertExistCheck(attendee1, 'member1');
    }
    if (exists(user2)) {
        attendee2 = await searchDBMemberById(guild, user2.id);
        assertExistCheck(attendee2, 'member2');
    }
    if (exists(user3)) {
        attendee3 = await searchDBMemberById(guild, user3.id);
        assertExistCheck(attendee3, 'member3');
    }

    const recruitBuffer = await recruitRegularCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        recruiter,
        attendee1,
        attendee2,
        attendee3,
        null,
        null,
        null,
        null,
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleRegularCanvas(regularData), {
        name: 'rules.png',
    });

    try {
        const recruitChannel = interaction.channel;
        const mention = `<@&${process.env.ROLE_ID_RECRUIT_REGULAR}>`;
        const image1Message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });

        if (!image1Message.inGuild()) return;

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            image1Message.id,
            hostMember.id,
            recruitNum,
            condition,
            channelName,
            RecruitType.RegularRecruit,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, recruiter, 0);
        if (exists(attendee1)) {
            await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, attendee1, 1);
        }
        if (exists(attendee2)) {
            await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, attendee2, 1);
        }
        if (exists(attendee3)) {
            await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, attendee3, 1);
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const sentMessage = await recruitChannel.send({
            content: mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(sentMessage, image1Message, image2Message)],
        });

        if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
            await sentMessage.edit({
                components: [recruitActionRow(image1Message, reservedChannel.id)],
            });
            await reservedChannel.permissionOverwrites.set(
                [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.Connect],
                    },
                    {
                        id: hostMember.user.id,
                        allow: [PermissionsBitField.Flags.Connect],
                    },
                ],
                'Reserve Voice Channel',
            );

            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                components: [unlockChannelButton(reservedChannel.id)],
                ephemeral: true,
            });
        } else {
            await sentMessage.edit({ components: [recruitActionRow(image1Message)] });
            await interaction.followUp({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // 募集リスト更新
        if (recruitChannel.isTextBased()) {
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: recruitChannel.id } });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (exists(deleteButtonCheck)) {
            await deleteButtonCheck.delete();
        } else {
            if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
                await reservedChannel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                await reservedChannel.permissionOverwrites.delete(hostMember.user, 'UnLock Voice Channel');
            }
            return;
        }

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const recruitData = await RecruitService.getRecruit(guild.id, image1Message.id);
        if (notExists(recruitData)) {
            return;
        }
        const participants = await ParticipantService.getAllParticipants(guild.id, image1Message.id);
        const memberList = getMemberMentions(recruitData.recruitNum, participants);
        const hostMention = `<@${hostMember.user.id}>`;

        await regenerateCanvas(guild, interaction.channelId, image1Message.id, RecruitOpCode.close);

        // DBから募集情報削除
        await RecruitService.deleteRecruit(guild.id, image1Message.id);
        await ParticipantService.deleteAllParticipant(guild.id, image1Message.id);

        await sentMessage.edit({
            content: '`[自動〆]`\n' + `${hostMention}たんの募集は〆！\n${memberList}`,
            components: setButtonDisable(sentMessage),
        });

        if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
            await reservedChannel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            await reservedChannel.permissionOverwrites.delete(hostMember.user, 'UnLock Voice Channel');
        }

        await sendCloseEmbedSticky(guild, recruitChannel);
    } catch (error) {
        logger.error(error);
    }
}
