const Discord = require("discord.js");
const regexDiscrdMessageUrl = 'https://(ptb.|canary.)?discord(app)?.com/channels/' +
    '(?<guild>[0-9]{18})/(?<channel>[0-9]{18})/(?<message>[0-9]{18})'

module.exports = {
    dispand: dispand
};

async function dispand(message) {
    messages = await extractMessages(message);
    for (var m in messages) {
        if (message.content) {
            await message.channel.send(composeEmbed(messages[m]));
        }
        for (var embed in messages[m].embeds) {
            await message.channel.send(messages[m].embeds[embed])
        }
    }
}

async function extractMessages(message) {
    let messages = new Array();
    let matches = message.content.match(regexDiscrdMessageUrl).groups;
    if (!matches) {
        return;
    }
    const guild = message.guild;
    if (guild.id != matches.guild) {
        return;
    }
    fetchedMessage = await fetchMessageFromId(guild, matches.channel, matches.message);
    messages.push(fetchedMessage);
    return messages;
}

async function fetchMessageFromId(guild, chId, msgId) {
    let channel = guild.channels.cache.find(channel => channel.id === chId);
    return channel.messages.fetch(msgId);
}

function composeEmbed(message) {
    const embed = new Discord.MessageEmbed();
    embed.setDescription(message.content);
    embed.setTimestamp(message.created_at);
    embed.setAuthor(
        name = message.author.username,
        iconURL = message.author.avatarURL()
    );
    embed.setFooter(
        text = message.channel.name,
        iconURL = message.guild.iconURL()
    );
    if (message.attachments.size > 0 && message.attachments[0].proxyURL) {
        embed.setImage(message.message.attachments[0].proxyURL);
    }
    return embed;
}