const app = require('app-root-path').resolve('app');
const { searchChannelById } = require(app + '/manager/channelManager.js');

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
    const channel = await searchChannelById(guild, channelId, null);
    let message;
    if (channel) {
        const messages = await channel.messages.fetch();
        message = messages.find((message) => message.id === messageId);
    }
    return message;
}
