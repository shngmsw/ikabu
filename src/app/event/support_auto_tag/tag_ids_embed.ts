import { EmbedBuilder } from "discord.js";
import { log4js_obj } from "../../../log4js_settings";

const logger = log4js_obj.getLogger("default");

export function tagIdsEmbed(thread: $TSFixMe) {
  try {
    let description =
      "管理者は環境変数に対応中タグのIDと回答済みタグのIDを設定するでし！\n";

    const tags = thread.parent.availableTags;
    for (let tag of tags) {
      description = description + tag.name + ": `" + tag.id + "`\n";
    }

    const embed = new EmbedBuilder();
    embed.setTitle("サポートセンタータグIDの設定");
    embed.setDescription(description);
    return embed;
  } catch (error) {
    logger.error(error);
  }
}
