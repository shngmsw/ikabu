const { EmbedBuilder } = require('discord.js');
const { sendEmbedsWebhook } = require('../../common/webhook');

module.exports = {
    sendRecruitButtonLog: sendRecruitButtonLog,
};

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
