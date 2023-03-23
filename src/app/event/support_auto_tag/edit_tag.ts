const { tagIdsEmbed } = require("./tag_ids_embed");
import { log4js_obj } from "../../../log4js_settings";
import { isEmpty } from "../../common/others";

const logger = log4js_obj.getLogger("default");

export async function editThreadTag(thread: $TSFixMe) {
  try {
    if (
      isEmpty(process.env.TAG_ID_SUPPORT_PROGRESS) ||
      isEmpty(process.env.TAG_ID_SUPPORT_RESOLVED)
    ) {
      await thread.send({ embeds: [tagIdsEmbed(thread)] });
      return;
    }

    let appliedTags = thread.appliedTags;
    appliedTags.push(process.env.TAG_ID_SUPPORT_PROGRESS);
    await thread.setAppliedTags(appliedTags, "質問対応開始");
  } catch (error) {
    logger.error(error);
  }
}
