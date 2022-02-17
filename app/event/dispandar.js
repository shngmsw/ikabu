const common = require('../common.js');
const regexDiscrdMessageUrl =
    'https://(ptb.|canary.)?discord(app)?.com/channels/' + '(?<guild>[0-9]{18})/(?<channel>[0-9]{18})/(?<message>[0-9]{18})';

module.exports = {
    dispand: dispand,
};

async function dispand(message) {
    var messages = await extractMessages(message);
    var url;
    for (var m in messages) {
        if (message.content) {
            url = message.content.match(regexDiscrdMessageUrl);
            await message.channel.send({
                embeds: [common.composeEmbed(messages[m], url[0])],
            });
        }
        for (var embed in messages[m].embeds) {
            await message.channel.send({ embeds: [messages[m].embeds[embed]] });
        }
        if (message.content == url) {
            message.delete();
        }
    }
}

async function extractMessages(message) {
    let messages = new Array();
    let matches = message.content.match(regexDiscrdMessageUrl);
    if (!matches) {
        return;
    }
    const guild = message.guild;
    if (guild.id != matches.groups.guild) {
        return;
    }
    fetchedMessage = await fetchMessageFromId(guild, matches.groups.channel, matches.groups.message);
    messages.push(fetchedMessage);
    return messages;
}

async function fetchMessageFromId(guild, chId, msgId) {
    let channel = guild.channels.cache.find((channel) => channel.id === chId);
    return channel.messages.fetch(msgId);
}
