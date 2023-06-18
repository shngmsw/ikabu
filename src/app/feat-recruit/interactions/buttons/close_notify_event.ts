import { ButtonInteraction, EmbedBuilder } from 'discord.js';

import { getMemberMentions } from './other_events.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components';
import { getGuildByInteraction } from '../../../common/manager/guild_manager.js';
import { searchDBMemberById } from '../../../common/manager/member_manager.js';
import { assertExistCheck, datetimeDiff, exists } from '../../../common/others.js';
import { getStickyChannelId, sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function closeNotify(interaction: ButtonInteraction<'cached' | 'raw'>) {
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

        if (recruitData.length === 0) {
            await interaction.editReply({ components: disableThinkingButton(interaction, '〆') });
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

        await sendRecruitButtonLog(interaction, member, recruiter, '〆', '#4f545c');

        const embed = new EmbedBuilder().setDescription(`<@${recruiterId}>たんの募集〆`);
        const buttonMessage = interaction.message;
        const recruitChannel = interaction.channel;

        if (member.userId === recruiterId) {
            const memberList = getMemberMentions(recruitData[0].recruitNum, participantsData);

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(guild.id, embedMessageId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(embedMessageId);

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集は〆！\n${memberList}`,
                components: disableThinkingButton(interaction, '〆'),
            });

            await interaction.followUp({ embeds: [embed], ephemeral: false });

            if (recruitChannel.isThread()) {
                // フォーラムやスレッドの場合は、テキストの募集チャンネルにSticky Messageを送信する
                const stickyChannelId = getStickyChannelId(recruitData[0]);
                if (exists(stickyChannelId)) {
                    await sendRecruitSticky({ channelOpt: { guild: guild, channelId: stickyChannelId } });
                }
            } else {
                await sendCloseEmbedSticky(guild, recruitChannel);
            }
        } else if (datetimeDiff(new Date(), interaction.message.createdAt) > 120) {
            const memberList = getMemberMentions(recruitData[0].recruitNum, participantsData);

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(guild.id, embedMessageId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(embedMessageId);

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集は〆！\n${memberList}`,
                components: disableThinkingButton(interaction, '〆'),
            });

            const embed = new EmbedBuilder().setDescription(`<@${recruiterId}>たんの募集〆 \n <@${member.userId}>たんが代理〆`);
            await interaction.followUp({ embeds: [embed], ephemeral: false });

            if (recruitChannel.isThread()) {
                // フォーラムやスレッドの場合は、テキストの募集チャンネルにSticky Messageを送信する
                const stickyChannelId = getStickyChannelId(recruitData[0]);
                if (exists(stickyChannelId)) {
                    await sendRecruitSticky({ channelOpt: { guild: guild, channelId: stickyChannelId } });
                }
            } else {
                await sendCloseEmbedSticky(guild, recruitChannel);
            }
        } else {
            await interaction.followUp({
                content: '募集主以外は募集を〆られないでし。',
                ephemeral: true,
            });
            await interaction.editReply({
                components: recoveryThinkingButton(interaction, '〆'),
            });
        }
    } catch (err) {
        logger.error(err);
        await interaction.message.edit({
            components: disableThinkingButton(interaction, '〆'),
        });
        await interaction.channel?.send('なんかエラー出てるわ');
    }
}
