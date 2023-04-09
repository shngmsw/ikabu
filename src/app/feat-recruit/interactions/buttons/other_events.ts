import { ButtonInteraction } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service.js';
import { log4js_obj } from '../../../../log4js_settings.js';
import { searchChannelById } from '../../../common/manager/channel_manager.js';
import { disableUnlockButton } from '../../buttons/create_recruit_buttons.js';
import { Participant } from '../../../../db/model/participant.js';
import { Recruit } from '../../../../db/model/recruit.js';
import { ParticipantService } from '../../../../db/participants_service.js';

const logger = log4js_obj.getLogger('recruitButton');

export async function unlock(interaction: ButtonInteraction, params: URLSearchParams) {
    /** @type {Discord.Snowflake} */

    try {
        const guild = await interaction.guild?.fetch();
        if (guild === undefined) {
            throw new Error('guild cannot fetch.');
        }
        if (interaction.member === null) {
            throw new Error('interaction.member is null');
        }
        const channelId = params.get('vid');
        const channel = await searchChannelById(guild, channelId);

        channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel');
        channel.permissionOverwrites.delete(interaction.member, 'UnLock Voice Channel');

        await interaction.update({
            components: [disableUnlockButton()],
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
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const recruit = await RecruitService.getRecruit(messageId);
    const participants = await ParticipantService.getAllParticipants(guild.id, messageId);
    const memberList = getMemberMentions(recruit[0], participants);
    const msgFirstRow = interaction.message.content.split('\n')[0];
    return msgFirstRow + '\n' + memberList;
}
