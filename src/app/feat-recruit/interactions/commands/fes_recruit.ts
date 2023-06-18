import { AttachmentBuilder, ChatInputCommandInteraction, GuildMember, PermissionsBitField, User, VoiceChannel } from 'discord.js';

import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkFes, getSchedule, getFesData, MatchInfo } from '../../../common/apis/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { searchRoleById, searchRoleIdByName } from '../../../common/manager/role_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { recruitFesCanvas, ruleFesCanvas } from '../../canvases/fes_canvas';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';
const logger = log4js_obj.getLogger('recruit');

export async function fesRecruit(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    assertExistCheck(interaction.channel, 'channel');

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const recruitNum = options.getInteger('募集人数') ?? -1;
    let condition = options.getString('参加条件');
    const guild = await getGuildByInteraction(interaction);
    const hostMember = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(hostMember, 'hostMember');
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    const team = interaction.commandName;
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

        if (!checkFes(schedule, type)) {
            await interaction.editReply({
                content: '募集を建てようとした期間はフェスが行われていないでし！',
            });
            return;
        }

        const fesData = await getFesData(schedule, type);

        let txt = `### <@${hostMember.user.id}>` + 'たんのフェスマッチ募集\n';
        const members = [];

        if (exists(user1)) {
            members.push(`<@${user1.id}>` + 'たん');
        }
        if (exists(user2)) {
            members.push(`<@${user2.id}>` + 'たん');
        }

        if (members.length != 0) {
            for (let i = 0; i < members.length; i++) {
                if (i == 0) {
                    txt = txt + members[i];
                } else {
                    txt = txt + 'と' + members[i];
                }
            }
            txt += 'の参加が既に決定しているでし！\n';
        }

        txt += 'よければ合流しませんか？';

        if (notExists(condition)) condition = 'なし';

        if (notExists(fesData)) {
            await interaction.editReply({
                content: 'フェスマッチの情報が取得できなかったでし！',
            });
            return;
        }

        await sendFesMatch(interaction, team, txt, recruitNum, condition, memberCounter, hostMember, user1, user2, fesData);
    } catch (error) {
        if (exists(channel)) {
            await channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendFesMatch(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    team: string,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
    fesData: MatchInfo,
) {
    const guild = await getGuildByInteraction(interaction);
    const mentionId = await searchRoleIdByName(guild, team);
    assertExistCheck(mentionId);
    const teamRole = await searchRoleById(guild, mentionId);
    assertExistCheck(teamRole, 'teamRole');

    if (notExists(mentionId)) {
        await interaction.editReply({
            content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
        });
        return;
    }

    const reservedChannel = interaction.options.getChannel('使用チャンネル');
    let channelName = null;
    if (exists(reservedChannel)) {
        channelName = reservedChannel.name;
    }

    const recruiter = await searchDBMemberById(guild, hostMember.id);
    assertExistCheck(recruiter, 'recruiter');
    const hostPt = new Participant(recruiter.userId, recruiter.displayName, recruiter.iconUrl, 0, new Date());

    let participant1 = null;
    let participant2 = null;

    if (exists(user1)) {
        const member = await searchDBMemberById(guild, user1.id);
        assertExistCheck(member, 'member1');
        participant1 = new Participant(user1.id, member.displayName, member.iconUrl, 1, new Date());
    }
    if (exists(user2)) {
        const member = await searchDBMemberById(guild, user2.id);
        assertExistCheck(member, 'member2');
        participant2 = new Participant(user2.id, member.displayName, member.iconUrl, 1, new Date());
    }

    const recruitBuffer = await recruitFesCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        hostPt,
        participant1,
        participant2,
        null,
        team,
        teamRole.hexColor,
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleFesCanvas(fesData), {
        name: 'rules.png',
    });

    try {
        const recruitChannel = interaction.channel;

        assertExistCheck(recruitChannel, 'channel');

        const image1Message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            image1Message.id,
            hostMember.id,
            recruitNum,
            condition,
            channelName,
            RecruitType.FestivalRecruit,
            team,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromObj(image1Message.id, hostPt);
        if (exists(participant1)) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, participant1);
        }
        if (exists(participant2)) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, participant2);
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const sentMessage = await recruitChannel.send({
            content: `<@&${mentionId}>` + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
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
        if (recruitData.length === 0) {
            return;
        }
        const participants = await ParticipantService.getAllParticipants(guild.id, image1Message.id);
        const memberList = getMemberMentions(recruitData[0].recruitNum, participants);
        const hostMention = `<@${hostMember.user.id}>`;

        await regenerateCanvas(guild, interaction.channelId, image1Message.id, RecruitOpCode.close);

        // DBから募集情報削除
        await RecruitService.deleteRecruit(guild.id, image1Message.id);
        await ParticipantService.deleteAllParticipant(image1Message.id);

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
