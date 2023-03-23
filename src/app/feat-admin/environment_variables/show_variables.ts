import { AttachmentBuilder } from "discord.js";
import { log4js_obj } from "../../../log4js_settings";

const logger = log4js_obj.getLogger("interaction");

export async function showVariables(interaction: $TSFixMe) {
  try {
    let env_file = new AttachmentBuilder("./.env", { name: "env.txt" });

    await interaction.editReply({
      content: "今の環境変数設定を表示するでし！",
      files: [env_file],
    });
  } catch (error) {
    logger.error(error);
  }
}
