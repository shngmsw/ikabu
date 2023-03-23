import { log4js_obj } from "../../../log4js_settings";
import { searchMessageById } from "../../common/manager/message_manager";
import { composeEmbed, isNotEmpty } from "../../common/others";

const logger = log4js_obj.getLogger("dispander");

const regexDiscordMessageUrl =
  "https://(ptb.|canary.)?discord(app)?.com/channels/" +
  "(?<guild>[0-9]{18,19})/(?<channel>[0-9]{18,19})/(?<message>[0-9]{18,19})";

export async function dispand(message: $TSFixMe) {
  try {
    let messages: any[] = await extractMessages(message);
    var url;

    if (isNotEmpty(messages)) {
      for (let m in messages) {
        if (message.content) {
          url = message.content.match(regexDiscordMessageUrl);
          const embed = await composeEmbed(messages[m], url[0]);
          await message.channel.send({
            embeds: [embed],
          });
        }
        for (var embed in messages[m].embeds) {
          await message.channel.send({ embeds: [messages[m].embeds[embed]] });
        }
        if (message.content === url[0]) {
          message.delete();
        }
      }
    }
  } catch (error) {
    logger.error(error);
    message.reply("なんかエラー出てるわ");
  }
}

async function extractMessages(message: $TSFixMe) {
  let messages = new Array();
  let matches = message.content.match(regexDiscordMessageUrl);
  if (!matches) {
    return [];
  }
  const guild = message.guild;
  if (guild.id != matches.groups.guild) {
    return [];
  }
  const fetchedMessage = await searchMessageById(
    guild,
    matches.groups.channel,
    matches.groups.message
  );
  if (isNotEmpty(fetchedMessage)) {
    messages.push(fetchedMessage);
  } else {
    message.reply("メッセージが見つからなかったでし！");
    return [];
  }

  return messages;
}
