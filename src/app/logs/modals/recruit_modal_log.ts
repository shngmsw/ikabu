// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require('../../common/manager/member_manager');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendEmbeds... Remove this comment to see the full error message
const { sendEmbedsWebhook } = require('../../common/webhook');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    sendRecruitModalLog: sendRecruitModalLog,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendRecrui... Remove this comment to see the full error message
async function sendRecruitModalLog(interaction: $TSFixMe) {
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
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
