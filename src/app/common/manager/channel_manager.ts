import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('ChannelManager');

/**
 * チャンネルを作成し，作成したチャンネルのIDを返す．
 * 既に同じカテゴリに同じチャンネル名のチャンネルが有る場合，そのチャンネルIDを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} categoryId カテゴリID or null
 * @param {string} channelName チャンネル名
 * @param {ChannelType} channelType チャンネルタイプ(discord.jsのenumを使用)
 * @returns チャンネルID
 */
export async function createChannel(guild: $TSFixMe, categoryId: $TSFixMe, channelName: $TSFixMe, channelType: $TSFixMe) {
    try {
        if (channelName == '') {
            return null;
        }

        let parentId = categoryId;
        if (categoryId == '') {
            parentId = null;
        }
        let channel;
        if ((await searchChannelIdByName(guild, channelName, channelType, parentId)) != null) {
            return await searchChannelIdByName(guild, channelName, channelType, parentId);
        } else {
            channel = await guild.channels.create({
                name: channelName,
                type: channelType,
                parent: parentId,
            });
            return channel.id;
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * チャンネル名からチャンネルIDを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelName チャンネル名
 * @param {ChannelType} channelType チャンネルタイプ(discord.jsのenumを使用)
 * @param {string} categoryId カテゴリID or null
 * @returns チャンネルID
 */
export async function searchChannelIdByName(guild: $TSFixMe, channelName: $TSFixMe, channelType: $TSFixMe, categoryId: $TSFixMe) {
    try {
        let channel;
        const channels = await guild.channels.fetch();
        if (categoryId != null) {
            channel = channels.find((c: $TSFixMe) => c.name == channelName && c.type == channelType && c.parent == categoryId);
        } else {
            channel = channels.find((c: $TSFixMe) => c.name == channelName && c.type == channelType);
        }

        if (channel != null) {
            return channel.id;
        } else {
            return null;
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * チャンネルIDからチャンネルを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @returns チャンネルオブジェクト
 */
export async function searchChannelById(guild: $TSFixMe, channelId: $TSFixMe) {
    let channel;
    try {
        channel = await guild.channels.fetch(channelId);
    } catch (error) {
        logger.warn('channel missing');
    }
    return channel;
}
