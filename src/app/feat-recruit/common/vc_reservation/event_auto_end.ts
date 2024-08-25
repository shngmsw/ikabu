import { GuildScheduledEventStatus, VoiceState } from 'discord.js';

import { exists, notExists } from '../../../common/others';

export async function eventAutoEnd(voiceState: VoiceState) {
    const guild = voiceState.guild;
    const voiceChannel = voiceState.channel;
    if (notExists(voiceChannel) || !voiceChannel.isVoiceBased()) return;
    const guildEvents = await guild.scheduledEvents.fetch();
    const event = guildEvents.find(
        (event) =>
            exists(event.channel) &&
            event.channel.id === voiceChannel.id &&
            event.status === GuildScheduledEventStatus.Active,
    );

    if (voiceChannel.members.size === 0 && exists(event)) {
        await event.setStatus(GuildScheduledEventStatus.Completed);
    }
}
