import { ButtonInteraction } from 'discord.js';

import { ParticipantService, participantMember } from '../../../../db/participant_service.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { disableThinkingButton } from '../../../common/button_components.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { getGuildByInteraction } from '../../../common/manager/guild_manager.js';
import { searchAPIMemberById } from '../../../common/manager/member_manager.js';
import { assertExistCheck, exists, notExists } from '../../../common/others.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function unlock(interaction: ButtonInteraction<'cached' | 'raw'>, params: URLSearchParams) {
    if (!interaction.message.inGuild()) return;
    try {
        const guild = await getGuildByInteraction(interaction);
        const channelId = params.get('vid');
        assertExistCheck(channelId, 'channelId');
        const channel = await searchChannelById(guild, channelId);
        const member = await searchAPIMemberById(guild, interaction.member.user.id);
        assertExistCheck(member, 'member');
        if (exists(member) && exists(channel) && channel.isVoiceBased()) {
            await channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
            await channel.permissionOverwrites.delete(member, 'UnLock Voice Channel');
        }

        await interaction.update({
            components: disableThinkingButton(interaction, 'ロック解除済み'),
        });
    } catch (err) {
        logger.error(err);
    }
}

export function getMemberMentions(recruitNum: number, participants: participantMember[]) {
    const applicantList = []; // 参加希望者リスト
    for (const participant of participants) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    let counter = `\`[${applicantList.length}]\``;
    if (recruitNum !== -1) {
        counter = `\`[${applicantList.length}/${recruitNum}]\``;
    }
    let mentionString = '**【参加表明一覧】**' + counter;
    for (const applicant of applicantList) {
        mentionString = mentionString + `\n<@${applicant.userId}> `;
    }
    return mentionString;
}

export async function memberListMessage(interaction: ButtonInteraction<'cached' | 'raw'>, messageId: string) {
    const guild = await getGuildByInteraction(interaction);
    const recruit = await RecruitService.getRecruit(guild.id, messageId);
    if (notExists(recruit)) return;
    const participants = await ParticipantService.getAllParticipants(guild.id, messageId);
    const memberList = getMemberMentions(recruit.recruitNum, participants);
    const msgFirstRow = interaction.message.content.split('\n')[0];
    return msgFirstRow + '\n' + memberList;
}
