// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchChan... Remove this comment to see the full error message
const { searchChannelById } = require('./channel_manager');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('MessageManager');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
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
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMess... Remove this comment to see the full error message
async function searchMessageById(guild: $TSFixMe, channelId: $TSFixMe, messageId: $TSFixMe) {
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
