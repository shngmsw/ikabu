// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'disableLim... Remove this comment to see the full error message
const { disableLimit } = require("../feat-utils/voice/voice_locker");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'autokill'.
const { autokill } = require("../feat-utils/voice/tts/discordjs_voice");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
  call: call,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger("voiceStateUpdate");

async function call(oldState: $TSFixMe, newState: $TSFixMe) {
  try {
    if (oldState.channelId === newState.channelId) {
      // ここはミュートなどの動作を行ったときに発火する場所
    } else if (oldState.channelId === null && newState.channelId != null) {
      // ここはconnectしたときに発火する場所
      deleteLimitPermission(newState);
    } else if (oldState.channelId != null && newState.channelId === null) {
      // ここはdisconnectしたときに発火する場所
      disableLimit(oldState);
      autokill(oldState);
    } else {
      // ここはチャンネル移動を行ったときに発火する場所
      deleteLimitPermission(newState);
      disableLimit(oldState);
      autokill(oldState);
    }
  } catch (error) {
    logger.error(error);
  }
}

// 募集時のVCロックの解除
async function deleteLimitPermission(newState: $TSFixMe) {
  const newChannel = await newState.guild.channels.fetch(newState.channelId);
  if (newChannel.members.size != 0) {
    newChannel.permissionOverwrites.delete(
      newState.guild.roles.everyone,
      "UnLock Voice Channel"
    );
    newChannel.permissionOverwrites.delete(
      newState.member,
      "UnLock Voice Channel"
    );
  }
}
