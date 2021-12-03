const request = require("request");
const common = require("./common.js");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const messageInsert = require("../db/rm_insert.js");
const reactionInsert = require("../db/rmr_insert.js");
const reactionDelete = require("../db/rmr_delete.js");
const getReactionUsers = require("../db/rmr_select.js");
const getReactions = require("../db/rm_select.js");
const deleteRandomMatching = require("../db/rm_delete.js");

var l_date;
var l_rule;
var l_stage;
var thumbnail_url;

const recruit_num = 2;

const TEAM_MEMBER_NUM = process.env.TEAM_MEMBER_NUM;
module.exports = {
  handleOneHourLeague,
  reactionUserInsert,
  reactionUserDelete
};

async function handleOneHourLeague(msg) {
  if (msg.content.startsWith("1h") && msg.channel.name != "botコマンド") {
    sendRecruitMessage(msg, 0);
  }
}

async function getReactionUsersList(messageId) {
  let result = await getReactionUsers.getReactionUsers(messageId);
  let userList = [];
  for (var data of result) {
    userList.push(data["user_id"]);
  }
  return userList;
}

async function reactionUserInsert(message, userId) {
  let result = await getReactionUsers.getReactionUserByUserId(userId);
  if (result.length > 0 && result[0]["user_id"] === userId) return;

  await reactionInsert(message.id, userId);

  let userList = await getReactionUsersList(message.id);
  if (userList.length == 0) return;
  if (userList.length >= recruit_num) {
    closeRecruit(message, userList);
  }
}

const closeRecruit = async (message, userList) => {
  await reactionDelete.deleteRandomMatchingReactionMessage(message.id);
  await deleteRandomMatching.deleteRandomMatchingMessage(message.id);
  message.react("🈵");
  let mentionList = createMentionList(userList);
  let txt = `4人そろったでし！空いているボイスチャンネルに入ってリグマするでし！\n${mentionList.join(" ")}`;
  message.channel.send({ content: txt });
};

const createMentionList = userIdList => {
  let mentionList = [];
  for (let i = 0; i < userIdList.length; i++) {
    mentionList.push(`<@${userIdList[i]}> `);
  }
  return mentionList;
};

async function reactionUserDelete(message, userId) {
  reactionDelete.deleteRandomMatchingReactionsUser(message.id, userId);
  let userList = await getReactionUsersList(message.id);
  if (userList.length == 0) return;
}

function sendRecruitMessage(msg, getLeagueNumber) {
  const channelName = "1時間リグマ募集";
  if (isNotThisChannel(msg, channelName)) {
    return;
  }
  var strCmd = msg.content.replace(/　/g, " ");
  strCmd = strCmd.replace("  ", " ");
  const args = strCmd.split(" ");
  args.shift();
  request.get("https://splatoon2.ink/data/schedules.json", function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      const l_args = common.getLeague(data, getLeagueNumber).split(",");
      let txt = "@everyone 【1時間だけリグマ】";
      msg.channel.send(txt);
      sendLeagueMatch(msg, l_args);
    } else {
      msg.channel.send("なんかエラーでてるわ");
    }
  });
}

function sendLeagueMatch(msg, l_args) {
  l_date = l_args[0];
  l_rule = l_args[1];
  l_stage = l_args[2];

  if (l_rule == "ガチエリア") {
    thumbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png";
  } else if (l_rule == "ガチヤグラ") {
    thumbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png";
  } else if (l_rule == "ガチホコバトル") {
    thumbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png";
  } else if (l_rule == "ガチアサリ") {
    thumbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png";
  } else {
    thumbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png";
  }

  const channelLeague = msg.guild.channels.cache.find(
    channel => channel.id === process.env.CHANNEL_ID_LEAGUE
  );

  msg.channel
    .send({
      embed: {
        author: {
          name: "リーグマッチ",
          icon_url:
            "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
        },
        description:
          `どんなに相性がよくて楽しかったメンバーだとしてもリグマするのは原則【1時間】のみ！\n` +
          `物足りない人は ${channelLeague} で募集してみるでし！\n\n` +
          `先着順で4人揃い次第募集は締め切り！\n`,
        color: 0xf02d7d,
        title: "1時間リグマ募集とは",
        url:
          "https://scrapbox.io/ikabu/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%9E%E3%83%83%E3%83%81%E3%83%B3%E3%82%B0(%CE%B2)%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6",
        fields: [
          {
            name: "日時",
            value: l_date
          },
          {
            name: "ルール",
            value: l_rule
          },
          {
            name: "ステージ",
            value: l_stage
          },
          {
            name: "参加条件",
            value: "誰でもOK！ウデマエ関係なくエンジョイで楽しめる人のみ参加してほしいでし！"
          },
          {
            name: "禁止事項",
            value: "メンバー決定後の無断欠席はNG"
          },
          {
            name: "募集主",
            value: `<@${msg.author.id}> `
          },
          {
            name: "✅リアクションで参加表明するでし！\n",
            value: "リアクションの数はブキチを含むので5なら1チーム成立でし！"
          }
        ],
        thumbnail: {
          url: thumbnail_url
        }
      }
    })
    .then(async sentMessage => {
      msg.delete().catch(error => {
        // Only log the error if it is not an Unknown Message error
        if (error.code !== 10008) {
          console.error("Failed to delete the message:", error);
        }
      });

      sentMessage.react("✅");

      const messageId = sentMessage.id;
      await messageInsert(messageId);
      await reactionInsert(messageId, msg.author.id);
    });
}

function isNotThisChannel(msg, channelName) {
  const msgSendedChannelName = msg.channel.name;
  if (!msgSendedChannelName.match(channelName)) {
    msg.channel.send("このコマンドはこのチャンネルでは使えないでし！");
    return true;
  }
  return false;
}
