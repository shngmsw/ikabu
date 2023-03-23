// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Permission... Remove this comment to see the full error message
const { PermissionsBitField, AttachmentBuilder } = require("discord.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const Dispander = require("../event/message_related/dispander");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DISCORD_VO... Remove this comment to see the full error message
const DISCORD_VOICE = require("../feat-utils/voice/tts/discordjs_voice");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleStageInfo = require("../feat-utils/splat3/stageinfo");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'randomBool... Remove this comment to see the full error message
const { randomBool, isNotEmpty } = require("../common/others");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const removeRookie = require("../event/rookie/remove_rookie.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const chatCountUp = require("../event/message_related/members.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const deleteToken = require("../event/message_related/delete_token.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendIntent... Remove this comment to see the full error message
const {
  sendIntentionConfirmReply,
} = require("../event/rookie/send_questionnaire");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  call: call,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger("message");

async function call(message: $TSFixMe) {
  try {
    if (message.author.bot) {
      if (message.content.startsWith("/poll")) {
        if (message.author.username === "ブキチ") {
          logger.info(message.author.username);
          message.delete();
        }
      }
      // ステージ情報
      if (message.content === "stageinfo") {
        handleStageInfo(message);
      }
      return;
    } else {
      // ステージ情報デバッグ用
      if (message.content === "stageinfo") {
        const guild = await message.guild.fetch();
        const member = await guild.members.fetch(message.author.id, {
          force: true, // intentsによってはGuildMemberUpdateが配信されないため
        });
        if (member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          handleStageInfo(message);
        }
      }

      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      if (isNotEmpty(process.env.QUESTIONNAIRE_URL)) {
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        if (
          message.channel.id != process.env.CHANNEL_ID_BOT_CMD &&
          randomBool(0.00025)
        ) {
          sendIntentionConfirmReply(
            message,
            message.author,
            "QUESTIONNAIRE_URL"
          );
        }
      }
    }
    if (message.content.match("ボーリング")) {
      message.reply(
        "```「ボウリング」とは、前方に正三角形に並べられた10本のピンと呼ばれる棒をめがけボールを転がし、倒れたピンの数によって得られる得点を競うスポーツでし。" +
          "専用施設のボウリング場に設置された細長いレーンの上で行われる屋内競技で、レーンの長さが約23m、ピンまでの距離は約18mで行われるのが一般的でし。" +
          "英語では “bowling” と書き、球を意味する “ball” ではなく、ラテン語で「泡」や「こぶ」を意味する “bowl” が語源とされているでし。" +
          "\n文部科学省は国語審議会で、球技を指す場合は「ボウリング」表記を用い、掘削を意味する「ボーリング」と区別することを推奨しているでし。```"
      );
    }
    if (message.content.match("お前を消す方法")) {
      const Kairu = new AttachmentBuilder("./images/Kairu.png");
      message.reply({ files: [Kairu] });
    }

    await deleteToken(message);
    Dispander.dispand(message);
    DISCORD_VOICE.play(message);
    await chatCountUp(message);
    removeRookie(message);
  } catch (error) {
    logger.error(error);
  }
}
