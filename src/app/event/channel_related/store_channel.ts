import { Client, NonThreadGuildBasedChannel } from 'discord.js';

import { ChannelService } from '../../../db/channel_service';
import { notExists } from '../../common/others';

export async function saveChannel(channel: NonThreadGuildBasedChannel) {
    await ChannelService.save(
        channel.guild.id,
        channel.id,
        channel.name,
        channel.type,
        channel.position,
        channel.parentId,
    );
}

export async function deleteChannel(channel: NonThreadGuildBasedChannel) {
    await ChannelService.delete(channel.guild.id, channel.id);
}

export async function saveChannelAtLaunch(client: Client) {
    const clientGuilds = client.guilds.cache;
    clientGuilds.forEach(async (guild) => {
        const channelCollection = await guild.channels.fetch();

        // チャンネルをDBに保存する
        channelCollection.forEach(async (channel) => {
            if (notExists(channel)) return;

            await ChannelService.save(
                guild.id,
                channel.id,
                channel.name,
                channel.type,
                channel.position,
                channel.parentId,
            );
        });

        // 削除されたチャンネルをDBから削除する
        const dbChannels = await ChannelService.getAllGuildChannels(guild.id);
        dbChannels.forEach(async (dbChannel) => {
            if (notExists(channelCollection.get(dbChannel.channelId))) {
                await ChannelService.delete(guild.id, dbChannel.channelId);
            }
        });
    });

    // 存在しないサーバーのチャンネルをDBから削除する
    const dbChannels = await ChannelService.getAllChannels();
    dbChannels.forEach(async (dbChannel) => {
        if (notExists(clientGuilds.get(dbChannel.guildId))) {
            await ChannelService.delete(dbChannel.guildId, dbChannel.channelId);
        }
    });
}
