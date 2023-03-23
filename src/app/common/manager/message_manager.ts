import { log4js_obj } from "../../../log4js_settings";

import { searchChannelById } from "./channel_manager";

const logger = log4js_obj.getLogger("MessageManager");

/**
 * メッセージIDからメッセージを検索する．ない場合はnullを返す．
 * @param {string} guild Guildオブジェクト
 * @param {string} channelId チャンネルID
 * @param {string} messageId メッセージID
 * @returns メッセージオブジェクト
 */
export async function searchMessageById(
  guild: $TSFixMe,
  channelId: $TSFixMe,
  messageId: $TSFixMe
) {
  const channel = await searchChannelById(guild, channelId);
  let message;
  if (channel) {
    try {
      // fetch(mid)とすれば、cache見てなければフェッチしてくる
      message = await channel.messages.fetch(messageId);
    } catch (error) {
      logger.warn("message missing");
    }
  }
  return message;
}
