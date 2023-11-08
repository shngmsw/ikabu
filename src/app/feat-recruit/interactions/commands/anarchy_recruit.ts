import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    User,
    VoiceChannel,
} from 'discord.js';

import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { UniqueRoleService } from '../../../../db/unique_role_service';
import { log4js_obj } from '../../../../log4js_settings';
import {
    checkFes,
    getSchedule,
    getAnarchyOpenData,
    MatchInfo,
} from '../../../common/apis/splatoon3.ink/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import {
    assertExistCheck,
    exists,
    getDeveloperMention,
    notExists,
    rule2image,
    sleep,
} from '../../../common/others';
import { RoleKeySet, getUniqueRoleNameByKey, isRoleKey } from '../../../constant/role_key';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import { getFestPeriodAlertText } from '../../alert_texts/schedule_related_alerts';
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

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const options = interaction.options;
    const channel = interaction.channel;
    const voiceChannel = interaction.options.getChannel('使用チャンネル');
    const rankRoleKey = options.getString('募集ウデマエ');
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
        await interaction.deleteReply();
        return await interaction.followUp({
            content: `\`${interaction.toString()}\`\n募集人数は1～3までで指定するでし！`,
            ephemeral: true,
        });
    } else {
        memberCounter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (exists(user1)) memberCounter++;
    if (exists(user2)) memberCounter++;

    if (memberCounter > 4) {
        await interaction.deleteReply();
        return await interaction.followUp({
            content: `\`${interaction.toString()}\`\n募集人数がおかしいでし！`,
            ephemeral: true,
        });
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
            await interaction.deleteReply();
            return await interaction.followUp({
                content: `\`${interaction.toString()}\`\nそのチャンネルは使用中でし！`,
                ephemeral: true,
            });
        } else if (!availableChannel.includes(voiceChannel.name)) {
            await interaction.deleteReply();
            return await interaction.followUp({
                content: `\`${interaction.toString()}\`\nそのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！`,
                ephemeral: true,
            });
        }
    }

    const anarchyRecruitRoleId = await UniqueRoleService.getRoleIdByKey(
        guild.id,
        RoleKeySet.AnarchyRecruit.key,
    );
    let mention = `<@&${anarchyRecruitRoleId}>`;
    let rank = '指定なし';
    // 募集条件がランクの場合はウデマエロールにメンション
    if (exists(rankRoleKey)) {
        if (!isRoleKey(rankRoleKey)) {
            return await sendErrorLogs(logger, 'rankRoleKey is not RoleKey');
        }
        rank = getUniqueRoleNameByKey(rankRoleKey);
        const rankRoleId = await UniqueRoleService.getRoleIdByKey(guild.id, rankRoleKey);
        if (notExists(rankRoleId)) {
            await interaction.deleteReply();
            return await interaction.channel.send(
                (await getDeveloperMention(guild.id)) +
                    `\nウデマエロール\`${rank}\`が設定されていないでし！`,
            );
        }
        mention = `<@&${rankRoleId}>`;
    }

    try {
        const schedule = await getSchedule();

        if (notExists(schedule)) {
            await interaction.deleteReply();
            return await interaction.followUp({
                content:
                    'スケジュールの取得に失敗したでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            });
        }

        if (checkFes(schedule, type)) {
            await interaction.deleteReply();
            return await interaction.followUp({
                content: await getFestPeriodAlertText(guild.id),
                ephemeral: true,
            });
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
            await interaction.deleteReply();
            return await interaction.followUp({
                content:
                    'バンカラマッチの情報が取得できなかったでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
                ephemeral: true,
            });
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
        await sendErrorLogs(logger, error);
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
    const ruleIconUrl = rule2image(anarchyData.rule);

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

    const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchyData, ruleIconUrl), {
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
        await sendErrorLogs(logger, error);
    }
}
