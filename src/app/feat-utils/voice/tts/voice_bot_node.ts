/**
 * MIT License
 * Copyright (c) 2020 noriokun4649
 */
// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
  setting: setting,
  mode_api: mode_api,
  messageReplace: messageReplace,
  bufferToStream: bufferToStream,
};

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { VoiceText } = require("voice-text");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { Readable } = require("stream");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const conf = require("config-reloadable");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const {
  searchMemberById,
} = require("../../../common/manager/member_manager.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const SHA256 = require("crypto-js/sha256");

let config = conf();
const voiceLists1 = {
  hikari: "ひかり（女性）",
  haruka: "はるか（女性）",
  takeru: "たける（男性）",
  santa: "サンタ",
  bear: "凶暴なクマ",
  show: "ショウ（男性）",
};

const modeList1 = {
  1: "HOYA VoiceText API",
};
const pitchList = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
const speedList = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
let context;
let voiceTextApiKey = null;
let prefix = "/";
let autoRestart = true;
let readMe = false;
let apiType = 1;
let voiceType = "haruka";
let blackList;
let speed = 100;
let pitch = 100;
const timeoutOffset = 5;

readConfig();
let voicePattern1 = voiceType; //初期時のよみあげ音声
let mode = apiType;
const voiceText = new VoiceText(voiceTextApiKey); //Voice Text API key

function readConfig() {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  voiceTextApiKey = process.env.VOICE_TEXT_API_KEY;
  prefix = config.get("Prefix");
  autoRestart = config.get("AutoRestart");
  if (typeof autoRestart !== "boolean")
    throw new Error("Require a boolean type.");
  readMe = config.get("ReadMe");
  if (typeof readMe !== "boolean") throw new Error("Require a boolean type.");
  apiType = config.get("Defalut.apiType");
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  if (!modeList1[apiType]) throw new Error("Unknown api.");
  voiceType = config.get("Defalut.voiceType");
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  if (!voiceLists1[voiceType]) throw new Error("Unknown voice.");
  blackList = config.get("BlackLists");
  return true;
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'mode_api'.
async function mode_api(msg: $TSFixMe) {
  if (mode === 1) {
    // ユーザーによって音声変える
    let member = await searchMemberById(msg.guild, msg.author.id);
    let displayNameSha256 = SHA256(member.displayName);
    let numberOnly = displayNameSha256.toString().replace(/[^0-9]/g, "");

    let selectPitch = numberOnly.substr(1, 1);
    let selectSpeed = numberOnly.substr(2, 1);
    const replacedMessage = await messageReplace(msg);
    if (replacedMessage.length == 0) {
      return null;
    }
    pitch = pitchList[selectPitch];
    speed = speedList[selectSpeed];
    return voiceText.fetchBuffer(replacedMessage, {
      format: "wav",
      speaker: voicePattern1,
      pitch,
      speed,
    });
  } else {
    throw Error(`不明なAPIが選択されています:${mode}`);
  }
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'bufferToSt... Remove this comment to see the full error message
function bufferToStream(buffer: $TSFixMe) {
  const hwm = 1024 * 1024;
  const stream = new Readable({ highWaterMark: hwm });
  stream.push(buffer);
  stream.push(null);
  return stream;
}

async function messageReplace(message: $TSFixMe) {
  const w_replace = (str: $TSFixMe) => {
    const judge = /.*w$/g;
    if (str.match(judge)) {
      const pat = /(w)/g;
      return str.replace(pat, "わらあた");
    }
    return str;
  };

  const url_delete = (str: $TSFixMe) => {
    const pat = /(https?:\/\/[\x21-\x7e]+)/g;
    return str.replace(pat, " URL省略。");
  };

  const emoji_delete = (str: $TSFixMe) => {
    const pat = /(<:\w*:\d*>)/g;
    return str.replace(pat, "");
  };

  // @ts-expect-error TS(7023): 'role_mention_replace' implicitly has return type ... Remove this comment to see the full error message
  const role_mention_replace = (str: $TSFixMe) => {
    const [matchAllElement] = str.matchAll(/<@&(\d*)>/g);
    if (matchAllElement === undefined) return str;
    for (var i = 0; i < [matchAllElement].length; i++) {
      let roleName = message.mentions.roles.get([matchAllElement][i][1]).name;
      str = str.replace([matchAllElement][i][0], "@" + roleName);
    }
    return role_mention_replace(str);
  };

  // @ts-expect-error TS(7023): 'nickname_mention_replace' implicitly has return t... Remove this comment to see the full error message
  const nickname_mention_replace = (str: $TSFixMe) => {
    const [matchAllElement] = str.matchAll(/<@!(\d*)>/g);
    if (matchAllElement === undefined) return str;
    for (var i = 0; i < [matchAllElement].length; i++) {
      let username = message.mentions.users.get(
        [matchAllElement][i][1]
      ).username;
      str = str.replace([matchAllElement][i][0], "@" + username);
    }
    return nickname_mention_replace(str);
  };

  // @ts-expect-error TS(7023): 'mention_replace' implicitly has return type 'any'... Remove this comment to see the full error message
  const mention_replace = (str: $TSFixMe) => {
    const [matchAllElement] = str.matchAll(/<@(\d*)>/g);
    if (matchAllElement === undefined) return str;
    for (var i = 0; i < [matchAllElement].length; i++) {
      let username = message.mentions.users.get(
        [matchAllElement][i][1]
      ).username;
      str = str.replace([matchAllElement][i][0], "@" + username);
    }
    return mention_replace(str);
  };

  // @ts-expect-error TS(7023): 'channel_replace' implicitly has return type 'any'... Remove this comment to see the full error message
  const channel_replace = async (str: $TSFixMe) => {
    const [matchAllElement] = str.matchAll(/<#(\d*)>/g);
    if (matchAllElement === undefined) return str;
    for (var i = 0; i < [matchAllElement].length; i++) {
      let chName = await message.guild.channels.fetch([matchAllElement][i][1])
        .name;
      str = str.replace([matchAllElement][i][0], chName);
    }
    return channel_replace(str);
  };

  const over200_cut = (str: $TSFixMe) => {
    if (str.length > 200) {
      const str200 = str.substr(0, 195) + "以下略";
      return str200;
    } else {
      return str;
    }
  };

  let url_deleted = url_delete(`${message.content}`);
  let emoji_deleted = emoji_delete(url_deleted);
  let w_replaced = w_replace(emoji_deleted);
  let mention_replaced = mention_replace(w_replaced);
  let nickname_replaced = nickname_mention_replace(mention_replaced);
  let role_mention_replaced = role_mention_replace(nickname_replaced);
  let channel_replaced = await channel_replace(role_mention_replaced);

  const yomiage_message = over200_cut(channel_replaced);
  return yomiage_message;
}

async function setting(interaction: $TSFixMe) {
  if (!interaction.isCommand()) return;
  if (!interaction.guild) return;
  const { options } = interaction;
  const subCommand = options.getSubcommand();

  if (subCommand != null && subCommand === "type") {
    const type = options.getString("音声の種類");
    voicePattern1 = type;
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const voiceMessage = `読み上げ音声を${voiceLists1[type]}に設定したでし`;

    await interaction.followUp(voiceMessage);
  }
}
