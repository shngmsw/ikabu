const { searchChannelById } = require('./channel_manager');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('MessageManager');

module.exports = {
    searchMessageById: searchMessageById,
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
        try {
            // fetch(mid)とすれば、cache見てなければフェッチしてくる
            message = await channel.messages.fetch(messageId);
        } catch (error) {
            logger.warn('message missing');
        }
    }
    return message;
}
