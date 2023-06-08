import { ButtonInteraction, EmbedBuilder } from 'discord.js';

import { memberListMessage } from './other_events.js';
import { Participant } from '../../../../db/model/participant.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton, recoveryThinkingButton, setButtonDisable } from '../../../common/button_components.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager.js';
import { assertExistCheck, createMentionsFromIdList, exists } from '../../../common/others.js';
import { sendStickyMessage } from '../../../common/sticky_message.js';
import { sendRecruitButtonLog } from '../../../logs/buttons/recruit_button_log.js';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas.js';
import {
    availableRecruitString,
    getStickyChannelId,
    sendCloseEmbedSticky,
    sendRecruitSticky,
} from '../../sticky/recruit_sticky_messages.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function cancel(interaction: ButtonInteraction, params: URLSearchParams) {
    if (!interaction.inGuild()) return;
    try {
        await interaction.update({
            components: setButtonDisable(interaction.message, interaction),
        });

        assertExistCheck(interaction.guild, 'guild');
        assertExistCheck(interaction.channel, 'channel');
        const guild = await interaction.guild.fetch();
        const channelId = params.get('vid');
        const image1MsgId = params.get('imid1');
        assertExistCheck(image1MsgId, "params.get('imid1')");

        // interaction.member.user.idでなければならない。なぜならば、APIInteractionGuildMemberはid を直接持たないからである。
        const member = await searchDBMemberById(guild, interaction.member.user.id);

        assertExistCheck(member, 'member');

        const recruitData = await RecruitService.getRecruit(guild.id, image1MsgId);

        if (recruitData.length === 0) {
            await interaction.editReply({ components: disableThinkingButton(interaction, 'キャンセル') });
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
        const recruitChannel = interaction.channel;

        if (confirmedMemberIDList.includes(member.userId)) {
            await regenerateCanvas(guild, recruitChannel.id, image1MsgId, RecruitOpCode.cancel);

            // recruitテーブルから削除
            await RecruitService.deleteRecruit(guild.id, image1MsgId);

            // participantsテーブルから該当募集のメンバー全員削除
            await ParticipantService.deleteAllParticipant(image1MsgId);

            if (exists(channelId)) {
                const channel = await searchChannelById(guild, channelId);
                const apiMember = await searchAPIMemberById(guild, interaction.member.user.id);
                if (exists(apiMember) && exists(channel) && channel.isVoiceBased()) {
                    channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
                    channel.permissionOverwrites.delete(apiMember, 'UnLock Voice Channel');
                }
            }

            await buttonMessage.edit({
                content: `<@${recruiterId}>たんの募集はキャンセルされたでし！`,
                components: disableThinkingButton(interaction, 'キャンセル'),
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
                    components: recoveryThinkingButton(interaction, 'キャンセル'),
                });

                if (recruitChannel.isTextBased()) {
                    const content = await availableRecruitString(guild, recruitChannel.id);
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
