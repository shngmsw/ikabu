import { VoiceBasedChannel, GuildMember, VoiceChannel, PermissionsBitField } from 'discord.js';

export function isVoiceChannelLockNeeded(
    voiceChannel: VoiceBasedChannel | null,
    recruiter: GuildMember,
): voiceChannel is VoiceChannel {
    return voiceChannel instanceof VoiceChannel && recruiter.voice.channelId !== voiceChannel.id;
}
export async function reserveVoiceChannel(voiceChannel: VoiceBasedChannel, recruiter: GuildMember) {
    if (voiceChannel instanceof VoiceChannel && recruiter.voice.channelId !== voiceChannel.id) {
        await voiceChannel.permissionOverwrites.set(
            [
                {
                    id: recruiter.guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.Connect],
                },
                {
                    id: recruiter.id,
                    allow: [PermissionsBitField.Flags.Connect],
                },
            ],
            'Reserve Voice Channel',
        );
    }
}

export async function removeVoiceChannelReservation(
    voiceChannel: VoiceBasedChannel,
    recruiter: GuildMember,
) {
    if (voiceChannel instanceof VoiceChannel && recruiter.voice.channelId !== voiceChannel.id) {
        await voiceChannel.permissionOverwrites.delete(
            voiceChannel.guild.roles.everyone,
            'UnLock Voice Channel',
        );
        await voiceChannel.permissionOverwrites.delete(recruiter.user, 'UnLock Voice Channel');
        return true;
    }
}
