module.exports = {
    sendCommandLog: sendCommandLog,
};

const { EmbedBuilder } = require('discord.js');
const { searchMemberById } = require('../manager/memberManager');

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
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
