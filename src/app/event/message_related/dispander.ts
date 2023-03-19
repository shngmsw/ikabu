// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, composeEmbed } = require('../../common/others');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMess... Remove this comment to see the full error message
const { searchMessageById } = require('../../common/manager/message_manager');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('dispander');

const regexDiscordMessageUrl =
    'https://(ptb.|canary.)?discord(app)?.com/channels/' + '(?<guild>[0-9]{18,19})/(?<channel>[0-9]{18,19})/(?<message>[0-9]{18,19})';

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    dispand: dispand,
};

async function dispand(message: $TSFixMe) {
    try {
        var messages = await extractMessages(message);
        var url;

        if (isNotEmpty(messages)) {
            for (var m in messages) {
                if (message.content) {
                    url = message.content.match(regexDiscordMessageUrl);
                    // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
                    embed = await composeEmbed(messages[m], url[0]);
                    await message.channel.send({
                        embeds: [embed],
                    });
                }
                // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
                for (var embed in messages[m].embeds) {
                    // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
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

async function extractMessages(message: $TSFixMe) {
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
