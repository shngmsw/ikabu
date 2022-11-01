const { searchChannelById } = require('../manager/channelManager');
const log4js = require('log4js');

log4js.configure('config/log4js-config.json');
const logger = log4js.getLogger('MessageManager');

module.exports = {
    searchMessageById: searchMessageById,
    getFullMessageObject: getFullMessageObject,
};

/**
 * メッセージIDからメッセージを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @param {string} messageId メッセージID
 * @returns メッセージオブジェクト
 */
async function searchMessageById(guild, channelId, messageId) {
    const channel = await searchChannelById(guild, channelId);
    let message;
    if (channel) {
        const messages = await channel.messages.fetch();
        message = messages.find((message) => message.id === messageId);
    }
    return message;
}

/**
 * メッセージIDからメッセージオブジェクトをfetchする．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @param {string} messageId メッセージID
 * @returns メッセージオブジェクト
 */
async function getFullMessageObject(guild, channelId, messageId) {
    const channel = await searchChannelById(guild, channelId);
    let message;
    if (channel) {
        try {
            message = await channel.messages.fetch({ message: messageId });
        } catch (error) {
            logger.warn('message missing');
        }
    }
    return message;
}
