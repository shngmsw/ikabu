import { EmbedBuilder } from "discord.js";
import { sendEmbedsWebhook } from "../../common/webhook";

export async function sendRecruitButtonLog(
  interaction: $TSFixMe,
  member: $TSFixMe,
  host_member: $TSFixMe,
  button_name: $TSFixMe,
  color: $TSFixMe
) {
  const embed = new EmbedBuilder();
  embed.setTitle(
    interaction.channel.name + "で" + button_name + "ボタンが押されたでし！"
  );
  embed.setAuthor({
    name: `${member.displayName} [${member.user.id}]`,
    iconURL: member.displayAvatarURL(),
  });
  embed.setDescription(
    "**募集主**: " + host_member.displayName + " [" + host_member.user.id + "]"
  );
  embed.setColor(color);
  embed.setTimestamp(interaction.createdAt);
  await sendEmbedsWebhook(process.env.BUTTON_LOG_WEBHOOK_URL, [embed]);
}
