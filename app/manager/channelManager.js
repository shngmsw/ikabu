module.exports = {
    createChannel: createChannel,
    searchChannelIdByName: searchChannelIdByName,
    searchChannelById: searchChannelById,
};

/**
 * チャンネルを作成し，作成したチャンネルのIDを返す．
 * 既に同じカテゴリに同じチャンネル名のチャンネルが有る場合，そのチャンネルIDを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} categoryId カテゴリID or null
 * @param {string} channelName チャンネル名
 * @param {string} channelType 'GUILD_TEXT' or 'GUILD_VOICE' or 'GUILD_CATEGORY'
 * @returns チャンネルID
 */
async function createChannel(guild, categoryId, channelName, channelType) {
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
        channel = await guild.channels.create(channelName, { type: channelType, parent: parentId });
        await guild.channels.fetch();
        return channel.id;
    }
}

/**
 * チャンネル名からチャンネルIDを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelName チャンネル名
 * @param {string} channelType 'GUILD_TEXT' or 'GUILD_VOICE' or 'GUILD_CATEGORY'
 * @param {string} categoryId カテゴリID or null
 * @returns チャンネルID
 */
async function searchChannelIdByName(guild, channelName, channelType, categoryId) {
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
}

/**
 * チャンネルIDからチャンネルを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @param {string} categoryId カテゴリID or null
 * @returns チャンネルオブジェクト
 */
async function searchChannelById(guild, channelId, categoryId) {
    var channel;
    const channels = await guild.channels.fetch();
    if (categoryId != null) {
        channel = channels.find((c) => c.id == channelId && c.parent == categoryId);
    } else {
        channel = channels.find((c) => c.id == channelId);
    }

    if (channel != null) {
        return channel;
    } else {
        return null;
    }
}
