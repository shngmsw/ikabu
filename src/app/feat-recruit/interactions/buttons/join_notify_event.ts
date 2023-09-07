import { ButtonInteraction, ChannelType, EmbedBuilder } from 'discord.js';

import { memberListMessage } from './other_events.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { ParticipantService, ParticipantMember } from '../../../../db/participant_service.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import {
    disableThinkingButton,
    recoveryThinkingButton,
    setButtonDisable,
} from '../../../common/button_components';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { getGuildByInteraction } from '../../../common/manager/guild_manager.js';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager.js';
import { searchMessageById } from '../../../common/manager/message_manager.js';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others.js';
import { sendErrorLogs } from '../../../logs/error/send_error_logs.js';
import { messageLinkButtons } from '../../buttons/create_recruit_buttons';
import { getStickyChannelId, sendRecruitSticky } from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function joinNotify(interaction: ButtonInteraction<'cached' | 'raw'>) {
    if (!interaction.message.inGuild()) return;
    try {
        await interaction.update({
            components: setButtonDisable(interaction.message, interaction),
        });

        assertExistCheck(interaction.channel, 'channel');

        const guild = await getGuildByInteraction(interaction);
        const embedMessageId = interaction.message.id;

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);
        assertExistCheck(member, 'member');

        const recruitData = await RecruitService.getRecruit(guild.id, embedMessageId);

        if (notExists(recruitData)) {
            await interaction.editReply({ components: disableThinkingButton(interaction, '参加') });
            await interaction.followUp({
                content: '募集データが存在しないでし！',
                ephemeral: false,
            });
            return;
        }

        const participantsData = await ParticipantService.getAllParticipants(
            guild.id,
            embedMessageId,
        );

        let recruiter = participantsData[0]; // 募集者
        const recruiterId = recruitData.authorId;
        const attendeeList: ParticipantMember[] = []; // 募集時参加確定者リスト
        const applicantList: ParticipantMember[] = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 0) {
                recruiter = participant;
            } else if (participant.userType === 1) {
                attendeeList.push(participant);
            } else {
                applicantList.push(participant);
            }
        }

        //  参加希望者のIDリスト
        const applicantIdList = [];
        for (const applicant of applicantList) {
            applicantIdList.push(applicant.userId);
        }

        await sendRecruitButtonLog(interaction, member, recruiter, '参加', '#5865f2');

        if (member.userId === recruiterId) {
            await interaction.followUp({
                content: '募集主は参加表明できないでし！',
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction, embedMessageId),
                components: recoveryThinkingButton(interaction, '参加'),
            });

            return;
        } else {
            // 参加済みかチェック
            if (applicantIdList.includes(member.userId)) {
                await interaction.followUp({
                    content: 'すでに参加ボタンを押してるでし！',
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
            await ParticipantService.registerParticipant(
                guild.id,
                embedMessageId,
                member.userId,
                2,
                new Date(),
            );

            const recruitChannel = interaction.channel;

            // ホストがVCにいるかチェックして、VCにいる場合はText in Voiceにメッセージ送信
            const recruiterGuildMember = await searchAPIMemberById(guild, recruiterId);
            try {
                if (
                    exists(recruiterGuildMember) &&
                    exists(recruiterGuildMember.voice.channel) &&
                    recruiterGuildMember.voice.channel.type === ChannelType.GuildVoice
                ) {
                    const hostJoinedVC = await searchChannelById(
                        guild,
                        recruiterGuildMember.voice.channel.id,
                    );

                    if (exists(hostJoinedVC) && hostJoinedVC.isTextBased()) {
                        await hostJoinedVC.send({
                            embeds: [embed],
                            components: [
                                messageLinkButtons(
                                    interaction.guildId,
                                    recruitChannel.id,
                                    interaction.message.id,
                                ),
                            ],
                        });
                    }
                }
            } catch (error) {
                await sendErrorLogs(logger, error);
            }

            const notifyMessage = await interaction.message.reply({
                content: `<@${recruiterId}>`,
                embeds: [embed],
            });

            // テキストの募集チャンネルにSticky Messageを送信
            const stickyChannelId = getStickyChannelId(recruitData) ?? recruitChannel.id;
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: stickyChannelId } });

            await interaction.followUp({
                content: `<@${recruiterId}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction, embedMessageId),
                components: recoveryThinkingButton(interaction, '参加'),
            });

            await sleep(300);
            // 5分後にホストへの通知を削除
            const checkNotifyMessage = await searchMessageById(
                guild,
                recruitChannel.id,
                notifyMessage.id,
            );
            if (exists(checkNotifyMessage)) {
                try {
                    await checkNotifyMessage.delete();
                } catch (error) {
                    logger.warn('notify message has been already deleted');
                }
            }
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
        await interaction.message.edit({
            components: disableThinkingButton(interaction, '参加'),
        });
        await interaction.channel?.send('なんかエラー出てるわ');
    }
}
