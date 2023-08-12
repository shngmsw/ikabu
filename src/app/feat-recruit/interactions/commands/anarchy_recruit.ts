import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    User,
    VoiceChannel,
} from 'discord.js';

import { placeHold } from '../../../../constant';
import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import {
    checkFes,
    getSchedule,
    getAnarchyOpenData,
    MatchInfo,
} from '../../../common/apis/splatoon3.ink/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { searchChannelById } from '../../../common/manager/channel_manager';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { searchRoleIdByName } from '../../../common/manager/role_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others';
import {
    recruitActionRow,
    recruitDeleteButton,
    unlockChannelButton,
} from '../../buttons/create_recruit_buttons';
import { recruitAnarchyCanvas, ruleAnarchyCanvas } from '../../canvases/anarchy_canvas';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function anarchyRecruit(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    assertExistCheck(interaction.channel, 'channel');

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    let rank = options.getString('募集ウデマエ');
    const recruitNum = options.getInteger('募集人数', true);
    let condition = options.getString('参加条件');
    const guild = await getGuildByInteraction(interaction);
    const hostMember = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(hostMember, 'hostMember');
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    let memberCounter = recruitNum; // プレイ人数のカウンター
    let type = 0;

    if (options.getSubcommand() === 'now') {
        type = 0;
    } else if (options.getSubcommand() === 'next') {
        type = 1;
    }

    if (recruitNum < 1 || recruitNum > 3) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        memberCounter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (exists(user1)) memberCounter++;
    if (exists(user2)) memberCounter++;

    if (memberCounter > 4) {
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
                content:
                    'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！',
                ephemeral: true,
            });
            return;
        }
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    let mention = `<@&${process.env.ROLE_ID_RECRUIT_ANARCHY}>`;
    // 募集条件がランクの場合はウデマエロールにメンション
    if (exists(rank)) {
        const mentionId = await searchRoleIdByName(guild, rank);
        if (notExists(mentionId)) {
            await interaction.editReply({
                content:
                    '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            });
            return;
        }
        mention = `<@&${mentionId}>`;
    } else {
        rank = '指定なし';
    }
    try {
        const schedule = await getSchedule();

        if (notExists(schedule)) {
            return await interaction.editReply({
                content:
                    'スケジュールの取得に失敗したでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            });
        }

        if (checkFes(schedule, type)) {
            assertExistCheck(process.env.CHANNEL_ID_RECRUIT_SHIVER, 'CHANNEL_ID_RECRUIT_SHIVER');
            assertExistCheck(process.env.CHANNEL_ID_RECRUIT_FRYE, 'CHANNEL_ID_RECRUIT_FRYE');
            assertExistCheck(process.env.CHANNEL_ID_RECRUIT_BIGMAN, 'CHANNEL_ID_RECRUIT_BIGMAN');
            const fes1ChannelId = await searchChannelById(
                guild,
                process.env.CHANNEL_ID_RECRUIT_SHIVER,
            );
            const fes2ChannelId = await searchChannelById(
                guild,
                process.env.CHANNEL_ID_RECRUIT_FRYE,
            );
            const fes3ChannelId = await searchChannelById(
                guild,
                process.env.CHANNEL_ID_RECRUIT_BIGMAN,
            );
            await interaction.editReply({
                content: `募集を建てようとした期間はフェス中でし！\n${fes1ChannelId}, ${fes2ChannelId}, ${fes3ChannelId}のチャンネルを使うでし！`,
            });
            return;
        }

        const anarchyData = await getAnarchyOpenData(schedule, type);

        let txt = `### <@${hostMember.user.id}>` + 'たんのバンカラ募集\n';
        if (exists(user1) && exists(user2)) {
            txt =
                txt +
                `<@${user1.id}>` +
                'たんと' +
                `<@${user2.id}>` +
                'たんの参加が既に決定しているでし！';
        } else if (exists(user1)) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (exists(user2)) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        if (notExists(condition)) condition = 'なし';

        if (notExists(anarchyData)) {
            await interaction.editReply({
                content: 'バンカラマッチの情報が取得できなかったでし！',
            });
            return;
        }

        await sendAnarchyMatch(
            interaction,
            mention,
            txt,
            recruitNum,
            condition,
            memberCounter,
            rank,
            hostMember,
            user1,
            user2,
            anarchyData,
        );
    } catch (error) {
        if (exists(channel)) {
            await channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

export type RuleIcon = {
    url: string; // ガチルールのアイコン
    xPosition: number; // アイコンx座標
    yPosition: number; // アイコンy座標
    xScale: number; // アイコン幅
    yScale: number; // アイコン高さ
};

async function sendAnarchyMatch(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    mention: string,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    rank: string,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
    anarchyData: MatchInfo,
) {
    let ruleIcon: RuleIcon;
    if (exists(anarchyData && anarchyData.rule)) {
        switch (anarchyData.rule) {
            case 'ガチエリア':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png',
                    xPosition: 600,
                    yPosition: 20,
                    xScale: 90,
                    yScale: 100,
                };
                break;
            case 'ガチヤグラ':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png',
                    xPosition: 595,
                    yPosition: 20,
                    xScale: 90,
                    yScale: 100,
                };
                break;
            case 'ガチホコバトル':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png',
                    xPosition: 585,
                    yPosition: 23,
                    xScale: 110,
                    yScale: 90,
                };
                break;
            case 'ガチアサリ':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png',
                    xPosition: 570,
                    yPosition: 20,
                    xScale: 120,
                    yScale: 100,
                };
                break;
            default:
                ruleIcon = {
                    url: placeHold.error100x100,
                    xPosition: 595,
                    yPosition: 20,
                    xScale: 100,
                    yScale: 100,
                };
                break;
        }
    } else {
        ruleIcon = {
            url: placeHold.error100x100,
            xPosition: 595,
            yPosition: 20,
            xScale: 100,
            yScale: 100,
        };
    }

    assertExistCheck(interaction.channel, 'channel');

    const guild = await getGuildByInteraction(interaction);
    const reservedChannel = interaction.options.getChannel('使用チャンネル');
    let channelName = null;
    if (exists(reservedChannel)) {
        channelName = reservedChannel.name;
    }

    const recruiter = await searchDBMemberById(guild, hostMember.id);
    assertExistCheck(recruiter, 'recruiter');

    let attendee1 = null;
    let attendee2 = null;

    if (exists(user1)) {
        attendee1 = await searchDBMemberById(guild, user1.id);
        assertExistCheck(attendee1, 'member1');
    }
    if (exists(user2)) {
        attendee2 = await searchDBMemberById(guild, user2.id);
        assertExistCheck(attendee2, 'member2');
    }

    const recruitBuffer = await recruitAnarchyCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        recruiter,
        attendee1,
        attendee2,
        null,
        condition,
        rank,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchyData, ruleIcon), {
        name: 'rules.png',
    });

    try {
        const recruitChannel = interaction.channel;
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
            RecruitType.AnarchyRecruit,
            rank,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromMember(
            guild.id,
            image1Message.id,
            recruiter,
            0,
        );
        if (exists(attendee1)) {
            await ParticipantService.registerParticipantFromMember(
                guild.id,
                image1Message.id,
                attendee1,
                1,
            );
        }
        if (exists(attendee2)) {
            await ParticipantService.registerParticipantFromMember(
                guild.id,
                image1Message.id,
                attendee2,
                1,
            );
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const sentMessage = await recruitChannel.send({
            content:
                mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(sentMessage, image1Message, image2Message)],
        });

        if (
            reservedChannel instanceof VoiceChannel &&
            hostMember.voice.channelId != reservedChannel.id
        ) {
            await sentMessage.edit({
                components: [recruitActionRow(image1Message, reservedChannel?.id)],
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
        const deleteButtonCheck = await searchMessageById(
            guild,
            recruitChannel.id,
            deleteButtonMsg.id,
        );
        if (exists(deleteButtonCheck)) {
            await deleteButtonCheck.delete();
        } else {
            if (
                reservedChannel instanceof VoiceChannel &&
                hostMember.voice.channelId != reservedChannel.id
            ) {
                await reservedChannel.permissionOverwrites.delete(
                    guild.roles.everyone,
                    'UnLock Voice Channel',
                );
                await reservedChannel.permissionOverwrites.delete(
                    hostMember.user,
                    'UnLock Voice Channel',
                );
            }
            return;
        }

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const recruitData = await RecruitService.getRecruit(guild.id, image1Message.id);
        if (notExists(recruitData)) {
            return;
        }
        const participants = await ParticipantService.getAllParticipants(
            guild.id,
            image1Message.id,
        );
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

        if (
            reservedChannel instanceof VoiceChannel &&
            hostMember.voice.channelId != reservedChannel.id
        ) {
            await reservedChannel.permissionOverwrites.delete(
                guild.roles.everyone,
                'UnLock Voice Channel',
            );
            await reservedChannel.permissionOverwrites.delete(
                hostMember.user,
                'UnLock Voice Channel',
            );
        }

        await sendCloseEmbedSticky(guild, recruitChannel);
    } catch (error) {
        logger.error(error);
    }
}
