import { BaseGuildTextChannel, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components';
import { searchDBMemberById } from '../../../common/manager/member_manager.js';
import { datetimeDiff, getCommandHelpEmbed } from '../../../common/others.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { createNewRecruitButton } from '../../buttons/create_recruit_buttons';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { getMemberMentions } from './other_events.js';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function closeNotify(interaction: ButtonInteraction) {
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
            await interaction.editReply({ components: await disableThinkingButton(interaction, '〆') });
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

        sendRecruitButtonLog(interaction, member, recruiter, '〆', '#4f545c');

        const embed = new EmbedBuilder().setDescription(`<@${recruiterId}>たんの募集〆`);
        const buttonMessage = interaction.message;
        const recruitChannel = interaction.channel;
        if (!(recruitChannel instanceof BaseGuildTextChannel)) {
            throw new Error('recruitChannel is not BaseGuildTextChannel type.');
        }

        if (member.userId === recruiterId) {
            const memberList = getMemberMentions(recruitData[0], participantsData);
            // ピン留め解除
            buttonMessage.unpin();

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(guild.id, embedMessageId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(embedMessageId);

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集は〆！\n${memberList}`,
                components: await disableThinkingButton(interaction, '〆'),
            });

            await interaction.followUp({ embeds: [embed], ephemeral: false });

            const content = await availableRecruitString(guild, recruitChannel.id, recruitData[0].recruitType);
            const helpEmbed = getCommandHelpEmbed(recruitChannel.name);
            await sendStickyMessage(guild, recruitChannel.id, {
                content: content,
                embeds: [helpEmbed],
                components: [createNewRecruitButton(recruitChannel.name)],
            });

            return;
        } else if (datetimeDiff(new Date(), interaction.message.createdAt) > 120) {
            const memberList = getMemberMentions(recruitData[0], participantsData);

            buttonMessage.unpin();

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(guild.id, embedMessageId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(embedMessageId);

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集は〆！\n${memberList}`,
                components: await disableThinkingButton(interaction, '〆'),
            });

            const embed = new EmbedBuilder().setDescription(`<@${recruiterId}>たんの募集〆 \n <@${member.userId}>たんが代理〆`);
            await interaction.followUp({ embeds: [embed], ephemeral: false });

            const content = await availableRecruitString(guild, recruitChannel.id, recruitData[0].recruitType);
            const helpEmbed = getCommandHelpEmbed(recruitChannel.name);
            await sendStickyMessage(guild, recruitChannel.id, {
                content: content,
                embeds: [helpEmbed],
                components: [createNewRecruitButton(recruitChannel.name)],
            });
        } else {
            await interaction.followUp({
                content: '募集主以外は募集を〆られないでし。',
                ephemeral: true,
            });
            await interaction.editReply({
                components: await recoveryThinkingButton(interaction, '〆'),
            });
        }
    } catch (err) {
        logger.error(err);
        await interaction.editReply({
            components: await disableThinkingButton(interaction, '〆'),
        });
        interaction.channel?.send('なんかエラー出てるわ');
    }
}
