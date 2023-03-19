// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendEmbeds... Remove this comment to see the full error message
const { sendEmbedsWebhook } = require('../../common/webhook');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    sendRecruitButtonLog: sendRecruitButtonLog,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendRecrui... Remove this comment to see the full error message
async function sendRecruitButtonLog(interaction: $TSFixMe, member: $TSFixMe, host_member: $TSFixMe, button_name: $TSFixMe, color: $TSFixMe) {
    const embed = new EmbedBuilder();
    embed.setTitle(interaction.channel.name + 'で' + button_name + 'ボタンが押されたでし！');
    embed.setAuthor({
        name: `${member.displayName} [${member.user.id}]`,
        iconURL: member.displayAvatarURL(),
    });
    embed.setDescription('**募集主**: ' + host_member.displayName + ' [' + host_member.user.id + ']');
    embed.setColor(color);
    embed.setTimestamp(interaction.createdAt);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    await sendEmbedsWebhook(process.env.BUTTON_LOG_WEBHOOK_URL, [embed]);
}
