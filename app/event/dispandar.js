const app = require('app-root-path').resolve('app');
const { searchMessageById } = require(app + '/manager/messageManager.js');
const common = require(app + '/common.js');
const regexDiscordMessageUrl =
    'https://(ptb.|canary.)?discord(app)?.com/channels/' + '(?<guild>[0-9]{18,19})/(?<channel>[0-9]{18,19})/(?<message>[0-9]{18,19})';

module.exports = {
    dispand: dispand,
};

async function dispand(message) {
    var messages = await extractMessages(message);
    var url;
    if (messages.length == 0) {
        message.reply('メッセージが見つからなかったでし！');
        return;
    }
    for (var m in messages) {
        if (message.content) {
            url = message.content.match(regexDiscordMessageUrl);
            await message.channel.send({
                embeds: [await common.composeEmbed(messages[m], url[0])],
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
    fetchedMessage = await searchMessageById(guild, matches.groups.channel, matches.groups.message);
    if (fetchedMessage) {
        messages.push(fetchedMessage);
    }

    return messages;
}
