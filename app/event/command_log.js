const { EmbedBuilder } = require('discord.js');
const { searchMemberById } = require('../common/manager/memberManager');
const { sendEmbedsWebhook } = require('../common/webhook');

module.exports = {
    sendCommandLog: sendCommandLog,
    sendRecruitButtonLog: sendRecruitButtonLog,
    sendRecruitModalLog: sendRecruitModalLog,
};

async function sendCommandLog(interaction) {
    const guild = interaction.guild;
    const channelName = interaction.channel.name;
    const authorId = interaction.member.user.id;
    // deferしてないけど、呼び出し元でawaitつけないので大丈夫なはず
    const author = await searchMemberById(guild, authorId);
    const commandName = interaction.toString();

    const embed = new EmbedBuilder();
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
    embed.setColor('#CFCFCF');
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}

async function sendRecruitButtonLog(interaction, member, host_member, button_name, color) {
    const embed = new EmbedBuilder();
    embed.setTitle(interaction.channel.name + 'で' + button_name + 'ボタンが押されたでし！');
    embed.setAuthor({
        name: `${member.displayName} [${member.user.id}]`,
        iconURL: member.displayAvatarURL(),
    });
    embed.setDescription('**募集主**: ' + host_member.displayName + ' [' + host_member.user.id + ']');
    embed.setColor(color);
    embed.setTimestamp(interaction.createdAt);
    await sendEmbedsWebhook(process.env.BUTTON_LOG_WEBHOOK_URL, [embed]);
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

    const embed = new EmbedBuilder();
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
