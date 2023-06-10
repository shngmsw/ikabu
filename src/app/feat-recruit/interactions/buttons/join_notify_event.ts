import { ButtonInteraction, ChannelType, EmbedBuilder } from 'discord.js';

import { memberListMessage } from './other_events.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager.js';
import { searchMessageById } from '../../../common/manager/message_manager.js';
import { assertExistCheck, exists, sleep } from '../../../common/others.js';
import { messageLinkButtons } from '../../buttons/create_recruit_buttons';
import { getStickyChannelId, sendRecruitSticky } from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function joinNotify(interaction: ButtonInteraction) {
    if (!interaction.inGuild()) return;
    try {
        await interaction.update({
            components: setButtonDisable(interaction.message, interaction),
        });

        assertExistCheck(interaction.guild, 'guild');
        assertExistCheck(interaction.channel, 'channel');

        const guild = await interaction.guild.fetch();
        const embedMessageId = interaction.message.id;

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);
        assertExistCheck(member, 'member');

        const recruitData = await RecruitService.getRecruit(guild.id, embedMessageId);

        if (recruitData.length === 0) {
            await interaction.editReply({ components: disableThinkingButton(interaction, '参加') });
            await interaction.followUp({
                content: '募集データが存在しないでし！',
                ephemeral: false,
            });
            return;
        }

        const participantsData = await ParticipantService.getAllParticipants(guild.id, embedMessageId);

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
            await ParticipantService.registerParticipant(embedMessageId, member.userId, 2, new Date());

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

            const notifyMessage = await interaction.message.reply({
                content: `<@${recruiterId}>`,
                embeds: [embed],
            });

            // テキストの募集チャンネルにSticky Messageを送信
            const stickyChannelId = getStickyChannelId(recruitData[0]) ?? recruitChannel.id;
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
        interaction.channel?.send('なんかエラー出てるわ');
    }
}
