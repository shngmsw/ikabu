import { EmbedBuilder } from "discord.js";
import { searchMemberById } from "../../common/manager/member_manager";
import { sendEmbedsWebhook } from "../../common/webhook";

export async function sendCommandLog(interaction: $TSFixMe) {
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
  await sendEmbedsWebhook(process.env.COMMAND_LOG_WEBHOOK_URL, [embed]);
}
