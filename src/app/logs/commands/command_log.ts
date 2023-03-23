// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require("discord.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require("../../common/manager/member_manager");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendEmbeds... Remove this comment to see the full error message
const { sendEmbedsWebhook } = require("../../common/webhook");

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
  sendCommandLog: sendCommandLog,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendComman... Remove this comment to see the full error message
async function sendCommandLog(interaction: $TSFixMe) {
  const guild = interaction.guild;
  const channelName = interaction.channel.name;
  const authorId = interaction.member.user.id;
  // deferしてないけど、呼び出し元でawaitつけないので大丈夫なはず
  const author = await searchMemberById(guild, authorId);
  const commandName = interaction.toString();

  const embed = new EmbedBuilder();
  embed.setTitle("コマンドログ");
  embed.setAuthor({
    name: `${author.displayName} [${interaction.member.user.id}]`,
    iconURL: author.displayAvatarURL(),
  });
  embed.addFields([
    {
      name: "使用コマンド",
      value: commandName,
      inline: true,
    },
    {
      name: "使用チャンネル",
      value: channelName,
      inline: false,
    },
  ]);
  embed.setColor("#CFCFCF");
  embed.setTimestamp(interaction.createdAt);
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
