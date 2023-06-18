import { AttachmentBuilder, ChatInputCommandInteraction, GuildMember, PermissionsBitField, User, VoiceChannel } from 'discord.js';

import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkBigRun, checkTeamContest, getSalmonData, getSchedule, getTeamContestData } from '../../../common/apis/splatoon3_ink';
import { sp3Schedule } from '../../../common/apis/types/schedule';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton, unlockChannelButton } from '../../buttons/create_recruit_buttons';
import { recruitBigRunCanvas, ruleBigRunCanvas } from '../../canvases/big_run_canvas';
import { RecruitOpCode } from '../../canvases/regenerate_canvas';
import { recruitSalmonCanvas, ruleSalmonCanvas } from '../../canvases/salmon_canvas';
import { sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function salmonRecruit(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    assertExistCheck(interaction.channel, 'channel');

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const recruitNum = options.getInteger('募集人数', true);
    let condition = options.getString('参加条件');
    const guild = await getGuildByInteraction(interaction);
    const subcommand = options.getSubcommand() ?? 'run';
    const hostMember = await searchAPIMemberById(guild, interaction.member.user.id);
    const user1 = options.getUser('参加者1');
    const user2 = options.getUser('参加者2');
    let memberCounter = recruitNum; // プレイ人数のカウンター

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

    assertExistCheck(hostMember);

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

    const schedule = await getSchedule();

    let type = RecruitType.SalmonRecruit;
    if (subcommand === 'run') {
        if (checkBigRun(schedule, 0)) {
            return await interaction.editReply(
                '現在ビッグラン開催中でし！\nビッグランの募集を建てる場合は`/サーモンラン募集 bigrun`を利用するでし！',
            );
        }
        type = RecruitType.SalmonRecruit;
    } else if (subcommand === 'bigrun') {
        if (!checkBigRun(schedule, 0)) {
            return await interaction.editReply(
                '現在ビッグランは行われていないでし！\n通常スケジュールの募集を建てる場合は`/サーモンラン募集 run`を利用するでし！',
            );
        }
        type = RecruitType.BigRunRecruit;
    } else if (subcommand === 'contest') {
        if (!checkTeamContest(schedule, 0)) {
            return await interaction.editReply(
                '現在チームコンテストは行われていないでし！\n通常スケジュールの募集を建てる場合は`/サーモンラン募集 run`を利用するでし！',
            );
        }
        type = RecruitType.TeamContestRecruit;
    }

    try {
        let txt = `### <@${hostMember.user.id}>` + 'たんのバイト募集\n';

        if (exists(user1) && exists(user2)) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (exists(user1)) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (exists(user2)) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (notExists(condition)) condition = 'なし';

        await sendSalmonRun(interaction, type, schedule, txt, recruitNum, condition, memberCounter, hostMember, user1, user2);
    } catch (error) {
        if (exists(channel)) {
            channel.send('なんかエラーでてるわ');
        }
        logger.error(error);
    }
}

async function sendSalmonRun(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    type: number,
    schedule: sp3Schedule,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    hostMember: GuildMember,
    user1: User | null,
    user2: User | null,
) {
    assertExistCheck(interaction.channel, 'channel');

    const guild = await getGuildByInteraction(interaction);
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

    let recruitBuffer;
    let ruleBuffer;
    if (type === RecruitType.SalmonRecruit) {
        recruitBuffer = await recruitSalmonCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            hostPt,
            participant1,
            participant2,
            null,
            condition,
            channelName,
        );
        ruleBuffer = await ruleSalmonCanvas(await getSalmonData(schedule, 0));
    } else if (type === RecruitType.BigRunRecruit) {
        recruitBuffer = await recruitBigRunCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            hostPt,
            participant1,
            participant2,
            null,
            condition,
            channelName,
        );
        ruleBuffer = await ruleBigRunCanvas(schedule);
    } else if (type === RecruitType.TeamContestRecruit) {
        recruitBuffer = await recruitSalmonCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            hostPt,
            participant1,
            participant2,
            null,
            condition,
            channelName,
            'コンテスト',
        );
        ruleBuffer = await ruleSalmonCanvas(await getTeamContestData(schedule, 0));
    }

    assertExistCheck(recruitBuffer, 'recruitBuffer');
    assertExistCheck(ruleBuffer, 'ruleBuffer');

    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });
    const rule = new AttachmentBuilder(ruleBuffer, { name: 'schedule.png' });

    try {
        const recruitChannel = interaction.channel;
        const mention = `<@&${process.env.ROLE_ID_RECRUIT_SALMON}>`;
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
            type,
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
            content: mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(sentMessage, image1Message, image2Message)],
        });
        if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
            sentMessage.edit({
                components: [recruitActionRow(image1Message, reservedChannel.id)],
            });
            reservedChannel.permissionOverwrites.set(
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
            sentMessage.edit({ components: [recruitActionRow(image1Message)] });
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
            deleteButtonCheck.delete();
        } else {
            if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
                reservedChannel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                reservedChannel.permissionOverwrites.delete(hostMember.user, 'UnLock Voice Channel');
            }
            return;
        }

        // 2時間後にVCロックを解除する
        await sleep(7200 - 15);

        if (reservedChannel instanceof VoiceChannel && hostMember.voice.channelId != reservedChannel.id) {
            reservedChannel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            reservedChannel.permissionOverwrites.delete(hostMember.user, 'UnLock Voice Channel');
        }
    } catch (error) {
        logger.error(error);
    }
}
