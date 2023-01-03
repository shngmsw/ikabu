const { EmbedBuilder } = require('discord.js');
const { searchMemberById } = require('../manager/memberManager');
const { sendEmbedsWebhook } = require('../common/webhook');

module.exports = {
    sendCommandLog: sendCommandLog,
    sendRecruitModalLog: sendRecruitModalLog,
};

async function sendCommandLog(interaction) {
    const guild = interaction.guild;
    const channelName = interaction.channel.name;
    const authorId = interaction.member.user.id;
    // deferしてないけど、呼び出し元でawaitつけないので大丈夫なはず
    const author = await searchMemberById(guild, authorId);
    const commandName = interaction.toString();

    embed = new EmbedBuilder();
    embed.setTitle('コマンドログ');
    embed.setAuthor({
        name: `${author.displayName} [${interaction.member.user.id}]`,
        iconURL: author.displayAvatarURL(),
    });
    embed.addFields([
        {
            name: '使用コマンド',
            value: commandName,
            inline: true,
        },
        {
            name: '使用チャンネル',
            value: channelName,
            inline: false,
        },
    ]);
    embed.setColor('#FFFFFF');
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}

async function sendRecruitModalLog(interaction) {
    const guild = interaction.guild;
    const channelName = interaction.channel.name;
    const authorId = interaction.member.user.id;
    // deferしてないけど、呼び出し元でawaitつけないので大丈夫なはず
    const author = await searchMemberById(guild, authorId);
    const components = interaction.components;
    let commandLog = '';

    for (let subcomponents of components) {
        commandLog = commandLog + subcomponents.components[0].customId + ': ' + subcomponents.components[0].value + '\n';
    }

    embed = new EmbedBuilder();
    embed.setTitle('モーダルログ');
    embed.setAuthor({
        name: `${author.displayName} [${interaction.member.user.id}]`,
        iconURL: author.displayAvatarURL(),
    });
    embed.addFields([
        {
            name: '募集パラメータ',
            value: commandLog,
            inline: true,
        },
        {
            name: '使用チャンネル',
            value: channelName,
            inline: false,
        },
    ]);
    embed.setColor('#56C000');
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
