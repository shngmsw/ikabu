import { BaseGuildTextChannel, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components';
import { searchDBMemberById } from '../../../common/manager/member_manager.js';
import { sendRecruitButtonLog } from '../.././../logs/buttons/recruit_button_log';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { memberListMessage } from './other_events.js';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages.js';
import { assertExistCheck, getCommandHelpEmbed } from '../../../common/others.js';
import { createNewRecruitButton } from '../../buttons/create_recruit_buttons.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function cancelNotify(interaction: ButtonInteraction) {
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
            await interaction.editReply({ components: disableThinkingButton(interaction, 'キャンセル') });
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

        sendRecruitButtonLog(interaction, member, recruiter, 'キャンセル', '#f04747');

        const embed = new EmbedBuilder().setDescription(`<@${recruiterId}>たんの募集〆`);
        const buttonMessage = interaction.message;
        const recruitChannel = interaction.channel;

        if (member.userId == recruiterId) {
            // recruitテーブルから削除
            await RecruitService.deleteRecruit(guild.id, embedMessageId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(embedMessageId);

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集はキャンセルされたでし！`,
                components: disableThinkingButton(interaction, 'キャンセル'),
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });

            if (recruitChannel instanceof BaseGuildTextChannel) {
                const content = await availableRecruitString(guild, recruitChannel.id, recruitData[0].recruitType);
                const helpEmbed = getCommandHelpEmbed(recruitChannel.name);
                await sendStickyMessage(guild, recruitChannel.id, {
                    content: content,
                    embeds: [helpEmbed],
                    components: [createNewRecruitButton(recruitChannel.name)],
                });
            }
        } else {
            // 参加済みかチェック
            if (applicantIdList.includes(member.userId)) {
                // participantsテーブルから自分のデータのみ削除
                await ParticipantService.deleteParticipant(embedMessageId, member.userId);

                // ホストに通知
                await interaction.message.reply({
                    content: `<@${recruiterId}> <@${member.userId}>たんがキャンセルしたでし！`,
                });
                await interaction.editReply({
                    content: await memberListMessage(interaction, embedMessageId),
                    components: recoveryThinkingButton(interaction, 'キャンセル'),
                });

                if (recruitChannel instanceof BaseGuildTextChannel) {
                    const content = await availableRecruitString(guild, recruitChannel.id, recruitData[0].recruitType);
                    await sendStickyMessage(guild, recruitChannel.id, content);
                }
            } else {
                await interaction.followUp({
                    content: '他人の募集は勝手にキャンセルできないでし！！',
                    ephemeral: true,
                });
                await interaction.editReply({
                    components: recoveryThinkingButton(interaction, 'キャンセル'),
                });
            }
        }
    } catch (err) {
        logger.error(err);
        await interaction.message.edit({
            components: disableThinkingButton(interaction, 'キャンセル'),
        });
        interaction.channel?.send('なんかエラー出てるわ');
    }
}
