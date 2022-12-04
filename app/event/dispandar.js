const { isNotEmpty, composeEmbed } = require('../common');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('dispander');

const regexDiscordMessageUrl =
    'https://(ptb.|canary.)?discord(app)?.com/channels/' + '(?<guild>[0-9]{18,19})/(?<channel>[0-9]{18,19})/(?<message>[0-9]{18,19})';

module.exports = {
    dispand: dispand,
};

async function dispand(message) {
    try {
        var messages = await extractMessages(message);
        var url;

        if (isNotEmpty(messages)) {
            for (var m in messages) {
                if (message.content) {
                    url = message.content.match(regexDiscordMessageUrl);
                    embed = await composeEmbed(messages[m], url[0]);
                    await message.channel.send({
                        embeds: [embed],
                    });
                }
                for (var embed in messages[m].embeds) {
                    await message.channel.send({ embeds: [messages[m].embeds[embed]] });
                }
                if (message.content === url[0]) {
                    message.delete();
                }
            }
        }
    } catch (error) {
        logger.error(error);
        message.reply('なんかエラー出てるわ');
    }
}

async function extractMessages(message) {
    let messages = new Array();
    let matches = message.content.match(regexDiscordMessageUrl);
    if (!matches) {
        return;
    }
    const guild = message.guild;
    if (guild.id != matches.groups.guild) {
        return;
    }
    const fetchedMessage = await searchMessageById(guild, matches.groups.channel, matches.groups.message);
    if (isNotEmpty(fetchedMessage)) {
        messages.push(fetchedMessage);
    } else {
        message.reply('メッセージが見つからなかったでし！');
        return;
    }

    return messages;
}

/**
 * メッセージIDからメッセージを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @param {string} messageId メッセージID
 * @returns メッセージオブジェクト
 */
async function searchMessageById(guild, channelId, messageId) {
    const channel = await searchChannelById(guild, channelId);
    let message = null;
    if (channel) {
        try {
            message = await channel.messages.fetch({ message: messageId });
        } catch (error) {
            logger.warn('message missing');
        }
    }
    return message;
}

/**
 * チャンネルIDからチャンネルを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @param {string} categoryId カテゴリID or null
 * @returns チャンネルオブジェクト
 */
async function searchChannelById(guild, channelId) {
    let channel = null;
    try {
        channel = await guild.channels.fetch(channelId);
    } catch (error) {
        logger.warn('channel missing');
    }
    return channel;
}
