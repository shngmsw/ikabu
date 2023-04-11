import { ButtonInteraction, ChannelType, EmbedBuilder } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager.js';
import { isNotEmpty, sleep } from '../../../common/others.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { messageLinkButtons } from '../../buttons/create_recruit_buttons';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { memberListMessage } from './other_events.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function joinNotify(interaction: ButtonInteraction) {
    /** @type {Discord.Snowflake} */
    try {
        await interaction.update({
            components: await setButtonDisable(interaction.message, interaction),
        });

        const guild = await interaction.guild?.fetch();
        if (guild === undefined) {
            throw new Error('guild cannot fetch.');
        }
        if (interaction.member === null) {
            throw new Error('interaction.member is null');
        }
        const embedMessageId = interaction.message.id;

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);

        const recruitData = await RecruitService.getRecruit(guild.id, embedMessageId);

        if (recruitData.length === 0) {
            await interaction.editReply({ components: await disableThinkingButton(interaction, '参加') });
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

        sendRecruitButtonLog(interaction, member, recruiter, '参加', '#5865f2');

        if (member.userId === recruiterId) {
            await interaction.followUp({
                content: '募集主は参加表明できないでし！',
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction, embedMessageId),
                components: await recoveryThinkingButton(interaction, '参加'),
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
                    components: await recoveryThinkingButton(interaction, '参加'),
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
            if (recruitChannel === null) {
                throw new Error('recruitChannel is null.');
            }

            // ホストがVCにいるかチェックして、VCにいる場合はText in Voiceにメッセージ送信
            let notifyMessage = null;
            const recruiterGuildMember = await searchAPIMemberById(guild, recruiterId);
            try {
                if (isNotEmpty(recruiterGuildMember.voice.channel) && recruiterGuildMember.voice.channel.type === ChannelType.GuildVoice) {
                    const hostJoinedVC = await searchChannelById(guild, recruiterGuildMember.voice.channelId);

                    await hostJoinedVC.send({
                        embeds: [embed],
                        components: [messageLinkButtons(interaction.guildId, recruitChannel.id, interaction.message.id)],
                    });
                }
            } catch (error) {
                logger.error(error);
            }
            notifyMessage = await interaction.message.reply({
                content: `<@${recruiterId}>`,
                embeds: [embed],
            });

            await interaction.followUp({
                content: `<@${recruiterId}>からの返答を待つでし！\n条件を満たさない場合は参加を断られる場合があるでし！`,
                ephemeral: true,
            });

            await interaction.editReply({
                content: await memberListMessage(interaction, embedMessageId),
                components: await recoveryThinkingButton(interaction, '参加'),
            });

            // 5分後にホストへの通知を削除
            if (notifyMessage !== null) {
                await sleep(300);
                try {
                    notifyMessage.delete();
                } catch (error) {
                    logger.warn('notify message has been already deleted');
                }
            }
        }
    } catch (err) {
        logger.error(err);
        await interaction.editReply({
            components: await disableThinkingButton(interaction, '参加'),
        });
        interaction.channel?.send('なんかエラー出てるわ');
    }
}
