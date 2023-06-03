import { ChannelType, Guild, NonThreadGuildBasedChannel } from 'discord.js';
import { log4js_obj } from '../../../log4js_settings';
import { exists } from '../others';

const logger = log4js_obj.getLogger('ChannelManager');

/**
 * チャンネルを作成し，作成したチャンネルのIDを返す．
 * 既に同じカテゴリに同じチャンネル名のチャンネルが有る場合，そのチャンネルIDを返す
 * @param guild Guildオブジェクト
 * @param categoryId カテゴリID or null
 * @param channelName チャンネル名
 * @param channelType チャンネルタイプ(discord.jsのenumを使用)
 * @returns チャンネルID
 */
export async function createChannel(guild: Guild, channelName: string, channelType: ChannelType, categoryId: string | null = null) {
    try {
        if (channelName === '') {
            return null;
        }

        let parentId = null;
        if (exists(categoryId) && categoryId !== '') {
            parentId = categoryId;
        }
        const channelId = await searchChannelIdByName(guild, channelName, channelType, parentId);
        if (exists(channelId)) {
            return channelId;
        } else {
            if (channelType === ChannelType.GuildCategory) {
                const channel = await guild.channels.create({
                    name: channelName,
                    type: channelType,
                });
                return channel.id;
            } else if (
                channelType === ChannelType.GuildAnnouncement ||
                channelType === ChannelType.GuildDirectory ||
                channelType === ChannelType.GuildForum ||
                channelType === ChannelType.GuildStageVoice ||
                channelType === ChannelType.GuildText ||
                channelType === ChannelType.GuildVoice
            ) {
                const channel = await guild.channels.create({
                    name: channelName,
                    type: channelType,
                    parent: parentId,
                });
                return channel.id;
            } else {
                return null;
            }
        }
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * チャンネル名からチャンネルIDを検索する．ない場合はnullを返す．
 * @param guild Guildオブジェクト
 * @param channelName チャンネル名
 * @param channelType チャンネルタイプ(discord.jsのenumを使用)
 * @param categoryId カテゴリID or null
 * @returns チャンネルID
 */
export async function searchChannelIdByName(guild: Guild, channelName: string, channelType: ChannelType, categoryId: string | null = null) {
    let channel = null;
    const channels = await guild.channels.fetch();

    try {
        if (exists(categoryId)) {
            channel = channels.find(
                (channel: NonThreadGuildBasedChannel | null) =>
                    exists(channel) && channel.name === channelName && channel.type === channelType && channel.parent?.id === categoryId,
            );
        } else {
            channel = channels.find(
                (channel: NonThreadGuildBasedChannel | null) =>
                    exists(channel) && channel.name == channelName && channel.type == channelType,
            );
        }
    } catch (error) {
        logger.warn('channel missing');
    }

    if (exists(channel)) {
        return channel.id;
    } else {
        return null;
    }
}

/**
 * チャンネルIDからチャンネルを検索する．ない場合はnullを返す．
 * @param guild Guildオブジェクト
 * @param channelId チャンネルID
 * @returns チャンネルオブジェクト
 */
export async function searchChannelById(guild: Guild, channelId: string) {
    let channel = null;
    try {
        channel = await guild.channels.fetch(channelId);
    } catch (error) {
        logger.warn('channel missing');
    }
    return channel;
}
