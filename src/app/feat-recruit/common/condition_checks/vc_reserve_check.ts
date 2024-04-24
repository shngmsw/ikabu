import { VoiceBasedChannel } from 'discord.js';

import { RecruitAlertTexts } from '../../alert_texts/alert_texts';

export function getVCReserveErrorMessage(voiceChannel: VoiceBasedChannel, recruiterId: string) {
    const availableChannel = [
        'alfa',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'fox',
        'golf',
        'hotel',
        'india',
        'juliett',
        'kilo',
        'lima',
        'mike',
    ];

    if (voiceChannel.members.size != 0 && !voiceChannel.members.has(recruiterId)) {
        return `${RecruitAlertTexts.ChannelAlreadyReserved}`;
    } else if (!availableChannel.includes(voiceChannel.name)) {
        return `${RecruitAlertTexts.ChannelNotAvailableForReservation}`;
    } else {
        return null;
    }
}
