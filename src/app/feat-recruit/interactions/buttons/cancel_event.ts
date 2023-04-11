import { BaseGuildTextChannel, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { searchDBMemberById } from '../../../common/manager/member_manager.js';
import { searchMessageById } from '../../../common/manager/message_manager.js';
import { createMentionsFromIdList, getCommandHelpEmbed } from '../../../common/others.js';
import { sendRecruitButtonLog } from '../../../logs/buttons/recruit_button_log.js';
import { createNewRecruitButton } from '../../buttons/create_recruit_buttons.js';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { memberListMessage } from './other_events.js';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function cancel(interaction: ButtonInteraction, params: URLSearchParams) {
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
        const channelId = params.get('vid');
        const image1MsgId = params.get('imid1');
        if (image1MsgId === null) {
            throw new Error('image1 message id is null.');
        }

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);

        const recruitData = await RecruitService.getRecruit(image1MsgId);

        if (recruitData.length === 0) {
            await interaction.editReply({ components: await disableThinkingButton(interaction, 'キャンセル') });
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

        sendRecruitButtonLog(interaction, member, recruiter, 'キャンセル', '#f04747');

        const embed = new EmbedBuilder().setDescription(`<@${recruiterId}>たんの募集〆`);
        const buttonMessage = interaction.message;
        const image1Message = await searchMessageById(guild, interaction.channelId, image1MsgId);
        const recruitChannel = interaction.channel;
        if (!(recruitChannel instanceof BaseGuildTextChannel)) {
            throw new Error('recruitChannel is not BaseGuildTextChannel type.');
        }

        if (confirmedMemberIDList.includes(member.userId)) {
            // ピン留め解除
            image1Message.unpin();

            await regenerateCanvas(guild, recruitChannel.id, image1MsgId, RecruitOpCode.cancel);

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(image1MsgId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(image1MsgId);

            if (channelId != null) {
                const channel = await searchChannelById(guild, channelId);
                channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');
            }

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集はキャンセルされたでし！`,
                components: await disableThinkingButton(interaction, 'キャンセル'),
            });
            await interaction.followUp({ embeds: [embed], ephemeral: false });

            const helpEmbed = getCommandHelpEmbed(recruitChannel.name);
            await recruitChannel.send({
                embeds: [helpEmbed],
                components: [createNewRecruitButton(recruitChannel.name)],
            });
        } else {
            // 既に参加済みかチェック
            if (applicantIdList.includes(member.userId)) {
                // participantsテーブルから自分のデータのみ削除
                await ParticipantService.deleteParticipant(image1MsgId, member.userId);

                await regenerateCanvas(guild, recruitChannel.id, image1MsgId, RecruitOpCode.open);

                // ホストに通知
                await interaction.message.reply({
                    content: createMentionsFromIdList(confirmedMemberIDList).join(' ') + `\n<@${member.userId}>たんがキャンセルしたでし！`,
                });
                await interaction.editReply({
                    content: await memberListMessage(interaction, image1MsgId),
                    components: await recoveryThinkingButton(interaction, 'キャンセル'),
                });
            } else {
                await interaction.followUp({
                    content: '他人の募集は勝手にキャンセルできないでし！！',
                    ephemeral: true,
                });
                await interaction.editReply({
                    components: await recoveryThinkingButton(interaction, 'キャンセル'),
                });
            }
        }
    } catch (err) {
        logger.error(err);
        await interaction.editReply({
            components: await disableThinkingButton(interaction, 'キャンセル'),
        });
        interaction.channel?.send('なんかエラー出てるわ');
    }
}