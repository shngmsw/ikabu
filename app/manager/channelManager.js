const { ChannelType } = require('discord.js');
const log4js = require('log4js');
const common = require('../common');
module.exports = {
    createChannel: createChannel,
    searchChannelIdByName: searchChannelIdByName,
    searchChannelById: searchChannelById,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('ChannelManager');

/**
 * チャンネルを作成し，作成したチャンネルのIDを返す．
 * 既に同じカテゴリに同じチャンネル名のチャンネルが有る場合，そのチャンネルIDを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} categoryId カテゴリID or null
 * @param {string} channelName チャンネル名
 * @param {ChannelType} channelType チャンネルタイプ(discord.jsのenumを使用)
 * @returns チャンネルID
 */
async function createChannel(guild, categoryId, channelName, channelType) {
    try {
        if (channelName == '') {
            return null;
        }

        var parentId = categoryId;
        if (categoryId == '') {
            parentId = null;
        }
        var channel;
        if ((await searchChannelIdByName(guild, channelName, channelType, parentId)) != null) {
            return await searchChannelIdByName(guild, channelName, channelType, parentId);
        } else {
            channel = await guild.channels.create({ name: channelName, type: channelType, parent: parentId });
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
async function searchChannelIdByName(guild, channelName, channelType, categoryId) {
    try {
        var channel;
        const channels = await guild.channels.fetch();
        if (categoryId != null) {
            channel = channels.find((c) => c.name == channelName && c.type == channelType && c.parent == categoryId);
        } else {
            channel = channels.find((c) => c.name == channelName && c.type == channelType);
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
async function searchChannelById(guild, channelId) {
    var channel;
    try {
        channel = await guild.channels.fetch(channelId);
    } catch (error) {
        logger.warn('channel missing');
    }
    return channel;
}
