import { ButtonInteraction } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { Participant } from '../../../../db/model/participant.js';
import { Recruit } from '../../../../db/model/recruit.js';
import { ParticipantService } from '../../../../db/participants_service.js';
import { assertExistCheck, exists } from '../../../common/others.js';
import { disableThinkingButton } from '../../../common/button_components.js';
import { searchAPIMemberById } from '../../../common/manager/member_manager.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function unlock(interaction: ButtonInteraction, params: URLSearchParams) {
    if (!interaction.inGuild()) return;
    try {
        assertExistCheck(interaction.guild, 'guild');
        const guild = await interaction.guild.fetch();
        const channelId = params.get('vid');
        assertExistCheck(channelId, 'channelId');
        const channel = await searchChannelById(guild, channelId);
        const member = await searchAPIMemberById(guild, interaction.member.user.id);
        if (exists(member) && exists(channel) && channel.isVoiceBased()) {
            channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            channel.permissionOverwrites.delete(member, 'UnLock Voice Channel');
        }

        await interaction.update({
            components: disableThinkingButton(interaction, 'ロック解除済み'),
        });
    } catch (err) {
        logger.error(err);
    }
}

export function getMemberMentions(recruit: Recruit, participants: Participant[]) {
    const applicantList = []; // 参加希望者リスト
    for (const participant of participants) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    let counter = `\`[${applicantList.length}]\``;
    if (recruit.recruitNum !== -1) {
        counter = `\`[${applicantList.length}/${recruit.recruitNum}]\``;
    }
    let mentionString = '**【参加表明一覧】**' + counter;
    for (const applicant of applicantList) {
        mentionString = mentionString + `\n<@${applicant.userId}> `;
    }
    return mentionString;
}

export async function memberListMessage(interaction: ButtonInteraction, messageId: string) {
    assertExistCheck(interaction.guild, 'guild');
    const guild = await interaction.guild.fetch();
    const recruit = await RecruitService.getRecruit(guild.id, messageId);
    const participants = await ParticipantService.getAllParticipants(guild.id, messageId);
    const memberList = getMemberMentions(recruit[0], participants);
    const msgFirstRow = interaction.message.content.split('\n')[0];
    return msgFirstRow + '\n' + memberList;
}
