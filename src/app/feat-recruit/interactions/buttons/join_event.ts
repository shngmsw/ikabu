import { ButtonInteraction, ChannelType, EmbedBuilder } from 'discord.js';

import { memberListMessage } from './other_events.js';
import { Participant } from '../../../../db/model/participant.js';
import { RecruitType } from '../../../../db/model/recruit.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { getGuildByInteraction } from '../../../common/manager/guild_manager.js';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager.js';
import { searchMessageById } from '../../../common/manager/message_manager.js';
import { assertExistCheck, createMentionsFromIdList, exists, notExists, sleep } from '../../../common/others.js';
import { sendRecruitButtonLog } from '../../../logs/buttons/recruit_button_log.js';
import { channelLinkButtons, messageLinkButtons, nsoRoomLinkButton } from '../../buttons/create_recruit_buttons.js';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas.js';
import { getStickyChannelId, sendRecruitSticky } from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function join(interaction: ButtonInteraction<'cached' | 'raw'>, params: URLSearchParams) {
    if (!interaction.message.inGuild()) return;
    try {
        await interaction.update({
            components: setButtonDisable(interaction.message, interaction),
        });

        assertExistCheck(interaction.channel, 'channel');

        const guild = await getGuildByInteraction(interaction);
        const channelId = params.get('vid');
        const image1MsgId = params.get('imid1');
        assertExistCheck(image1MsgId, "params.get('imid1')");

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);
        assertExistCheck(member, 'member');

        const recruitData = await RecruitService.getRecruit(guild.id, image1MsgId);

        if (recruitData.length === 0) {
            await interaction.editReply({ components: disableThinkingButton(interaction, '参加') });
            await interaction.followUp({
                content: '募集データが存在しないでし！',
                ephemeral: false,
            });
            return;
        }

        const participantsData = await ParticipantService.getAllParticipants(guild.id, image1MsgId);

        let recruiter = participantsData[0]; // 募集者
        const recruiterId = recruitData[0].authorId;
        const attendeeList: Participant[] = []; // 募集時参加確定者リスト
        const applicantList: Participant[] = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 0) {
                recruiter = participant;
            } else if (participant.userType === 1) {
                attendeeList.push(participant);
            } else {
                applicantList.push(participant);
            }
        }

        // 募集者と募集時参加確定者のIDリスト
        const confirmedMemberIDList = [];
        confirmedMemberIDList.push(recruiterId);
        for (const attendee of attendeeList) {
            confirmedMemberIDList.push(attendee.userId);
        }

        //  参加希望者のIDリスト
        const applicantIdList = [];
        for (const applicant of applicantList) {
            applicantIdList.push(applicant.userId);
        }

        await sendRecruitButtonLog(interaction, member, recruiter, '参加', '#5865f2');

        if (confirmedMemberIDList.includes(member.userId)) {
            await interaction.followUp({
                content: '募集メンバーは参加表明できないでし！',
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction, image1MsgId),
                components: recoveryThinkingButton(interaction, '参加'),
            });
            return;
        } else {
            // 参加済みかチェック
            if (applicantIdList.includes(member.userId)) {
                await interaction.followUp({
                    content: '既に参加ボタンを押してるでし！',
                    ephemeral: true,
                });

                await interaction.editReply({
                    components: recoveryThinkingButton(interaction, '参加'),
                });
                return;
            }

            const embed = new EmbedBuilder();
            embed.setAuthor({
                name: `${member.displayName}たんが参加表明したでし！`,
                iconURL: member.iconUrl,
            });

            // recruitテーブルにデータ追加
            await ParticipantService.registerParticipant(image1MsgId, member.userId, 2, new Date());

            const recruitChannel = interaction.channel;

            // ホストがVCにいるかチェックして、VCにいる場合はText in Voiceにメッセージ送信
            const recruiterGuildMember = await searchAPIMemberById(guild, recruiterId);
            try {
                if (
                    exists(recruiterGuildMember) &&
                    exists(recruiterGuildMember.voice.channel) &&
                    recruiterGuildMember.voice.channel.type === ChannelType.GuildVoice
                ) {
                    const hostJoinedVC = await searchChannelById(guild, recruiterGuildMember.voice.channel.id);

                    if (exists(hostJoinedVC) && hostJoinedVC.isTextBased()) {
                        await hostJoinedVC.send({
                            embeds: [embed],
                            components: [messageLinkButtons(interaction.guildId, recruitChannel.id, interaction.message.id)],
                        });
                    }
                }
            } catch (error) {
                logger.error(error);
            }

            await regenerateCanvas(guild, recruitChannel.id, image1MsgId, RecruitOpCode.open);

            const notifyMessage = await interaction.message.reply({
                content: createMentionsFromIdList(confirmedMemberIDList).join(' '),
                embeds: [embed],
            });

            // テキストの募集チャンネルにSticky Messageを送信
            const stickyChannelId = getStickyChannelId(recruitData[0]) ?? recruitChannel.id;
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: stickyChannelId } });

            if (notExists(channelId)) {
                await interaction.followUp({
                    content: `<@${recruiterId}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    // components: [channelLinkButtons(interaction.guildId, thread_message.url)], TODO: スレッド内へのリンクボタンを作る
                    ephemeral: true,
                });
            } else {
                await interaction.followUp({
                    content: `<@${recruiterId}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                    components: [channelLinkButtons(guild.id, channelId)],
                    ephemeral: true,
                });
            }

            if (recruitData[0].recruitType === RecruitType.PrivateRecruit && exists(recruitData[0].option)) {
                await interaction.followUp({
                    content: `ボタンを押すとヘヤタテ機能を使ってプライベートマッチの部屋に参加できるでし！`,
                    components: [nsoRoomLinkButton(recruitData[0].option)],
                    ephemeral: true,
                });
            }

            await interaction.editReply({
                content: await memberListMessage(interaction, image1MsgId),
                components: recoveryThinkingButton(interaction, '参加'),
            });

            await sleep(300);
            // 5分後にホストへの通知を削除
            const checkNotifyMessage = await searchMessageById(guild, recruitChannel.id, notifyMessage.id);
            if (exists(checkNotifyMessage)) {
                try {
                    await checkNotifyMessage.delete();
                } catch (error) {
                    logger.warn('notify message has been already deleted');
                }
            }
        }
    } catch (err) {
        logger.error(err);
        await interaction.message.edit({
            components: disableThinkingButton(interaction, '参加'),
        });
        await interaction.channel?.send('なんかエラー出てるわ');
    }
}
