const fetch = require("node-fetch");
const common = require("../common.js");
const { MessageEmbed } = require("discord.js");
const schedule_url = "https://splatoon2.ink/data/schedules.json";
const coop_schedule_url = "https://splatoon2.ink/data/coop-schedules.json";

module.exports = function handleRecruit(msg) {
  if (msg.content.startsWith("next") && msg.channel.name != "botコマンド") {
    recruitLeagueMatch(msg, 1);
  }
  if (msg.content.startsWith("now") || msg.content.startsWith("nou")) {
    recruitLeagueMatch(msg, 0);
  }

  if (msg.content.startsWith("nawabari")) {
    regularMatch(msg);
  }

  if (msg.content.startsWith("run")) {
    salmonRun(msg);
  }

  /**
   * 別ゲー
   */
  if (msg.content.startsWith("!mhr")) {
    monsterHunterRize(msg);
  }
  if (msg.content.startsWith("!apex")) {
    apexLegends(msg);
  }
  if (msg.content.startsWith("!dbd")) {
    deadByDayLight(msg);
  }
};

async function recruitLeagueMatch(msg, type) {
  const channelName = "リグマ募集";
  if (isNotThisChannel(msg, channelName)) {
    return;
  }

  var strCmd = msg.content.replace(/　/g, " ");
  strCmd = strCmd.replace("  ", " ");
  const args = strCmd.split(" ");
  args.shift();
  if (strCmd.match("〆")) {
    sendCloseMessage(msg);
  } else {
    try {
      const response = await fetch(schedule_url);
      const data = await response.json();
      const l_args = common.getLeague(data, type).split(",");
      let condition = "なし";
      let txt =
        "@everyone 【リグマ募集】\n" +
        `<@${msg.author.id}>` +
        "たんがリグメン募集中でし！\n";
      if (args.length > 0) condition = args.join("\n") + "\n";
      const stage_a =
        "https://splatoon2.ink/assets/splatnet" +
        data.league[type].stage_a.image;
      const stage_b =
        "https://splatoon2.ink/assets/splatnet" +
        data.league[type].stage_b.image;
      const stageImages = [stage_a, stage_b];
      sendLeagueMatch(msg, txt, condition, l_args, stageImages);
    } catch (error) {
      msg.channel.send("なんかエラーでてるわ");
      console.error(error);
    }
  }
}

async function regularMatch(msg) {
  const channelName = "ナワバリ・フェス募集";
  if (isNotThisChannel(msg, channelName)) {
    return;
  }
  var strCmd = msg.content.replace(/　/g, " ");
  strCmd = strCmd.replace("  ", " ");
  const args = strCmd.split(" ");
  args.shift();
  if (strCmd.match("〆")) {
    sendCloseMessage(msg);
  } else {
    try {
      const response = await fetch(schedule_url);
      const data = await response.json();
      const stage_a =
        "https://splatoon2.ink/assets/splatnet" + data.regular[0].stage_a.image;
      const stage_b =
        "https://splatoon2.ink/assets/splatnet" + data.regular[0].stage_b.image;
      let condition = "なし";
      let txt =
        "@everyone 【ナワバリ募集】\n" +
        `<@${msg.author.id}>` +
        "たんがナワバリ中でし！\n";
      if (args.length > 0) condition = args.join("\n") + "\n";
      txt += "よければ合流しませんか？";
      const date =
        common.unixTime2mdwhm(data.regular[0].start_time) +
        " – " +
        common.unixTime2mdwhm(data.regular[0].end_time);
      const regular_stage =
        common.stage2txt(data.regular[0].stage_a.id) +
        "\n" +
        common.stage2txt(data.regular[0].stage_b.id) +
        "\n";
      const embed = new MessageEmbed()
        .setAuthor({
          name: "レギュラーマッチ",
          iconURL: "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png",
        })
        .setColor(1693465)
        .addFields({
          name: date,
          value: regular_stage,
        })
        .addFields({
          name: "参加条件",
          value: condition,
        })
        .setThumbnail(
          "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
        );
      const imageEmbedA = new MessageEmbed().setImage(stage_a);
      const imageEmbedB = new MessageEmbed().setImage(stage_b);

      msg.reply({
        content: txt,
        embeds: [embed, imageEmbedA, imageEmbedB],
      });
    } catch (error) {
      msg.channel.send("なんかエラーでてるわ");
      console.error(error);
    }
  }
}

async function salmonRun(msg) {
  const channelName = "サーモン募集";
  if (isNotThisChannel(msg, channelName)) {
    return;
  }
  var strCmd = msg.content.replace(/　/g, " ");
  strCmd = strCmd.replace("  ", " ");
  const args = strCmd.split(" ");
  args.shift();
  if (strCmd.match("〆")) {
    sendCloseMessage(msg);
  } else {
    try {
      const response = await fetch(coop_schedule_url);
      const data = await response.json();
      const stage =
        "https://splatoon2.ink/assets/splatnet" + data.details[0].stage.image;
      let condition = "なし";
      let txt =
        "@everyone 【バイト募集】\n" +
        `<@${msg.author.id}>` +
        "たんがバイト中でし！\n";
      if (args.length > 0) condition = args.join("\n") + "\n";
      txt += "よければ合流しませんか？";
      const date =
        common.unixTime2mdwhm(data.details[0].start_time) +
        " – " +
        common.unixTime2mdwhm(data.details[0].end_time);
      const coop_stage =
        common.coop_stage2txt(data.details[0].stage.image) + "\n";
      const weapons =
        common.weapon2txt(data.details[0].weapons[0].id) +
        "・" +
        common.weapon2txt(data.details[0].weapons[1].id) +
        "・" +
        common.weapon2txt(data.details[0].weapons[2].id) +
        "・" +
        common.weapon2txt(data.details[0].weapons[3].id);

      const embed = new MessageEmbed()
        .setAuthor({
          name: "SALMON RUN",
          iconURL:
            "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png",
        })
        .setColor(16733696)
        .addFields({
          name: "日時",
          value: date,
        })
        .addFields({
          name: "支給ブキ",
          value: weapons,
        })
        .addFields({
          name: "ステージ",
          value: coop_stage,
        })
        .addFields({
          name: "参加条件",
          value: condition,
        })
        .setImage(stage);

      msg.reply({
        content: txt,
        embeds: [embed],
      });
    } catch (error) {
      msg.channel.send("なんかエラーでてるわ");
      console.error(error);
    }
  }
}

function monsterHunterRize(msg) {
  const role_id = msg.guild.roles.cache.find(
    (role) => role.name === "ハンター"
  );
  let txt =
    role_id.toString() +
    " 【モンハンライズ募集】\n" +
    `<@${msg.author.id}>` +
    "たんがモンハンライズ参加者募集中でし！\n";
  const image =
    "https://cdn.glitch.com/10652966-57f9-4b23-8909-a9d93dfe6d26%2Fmhrize-title.jpeg";
  sendOtherGames(msg, txt, image);
}

function apexLegends(msg) {
  const role_id = msg.guild.roles.cache.find(
    (role) => role.name === "レジェンド"
  );
  let txt =
    role_id.toString() +
    " 【ApexLegends募集】\n" +
    `<@${msg.author.id}>` +
    "たんがApexLegendsの参加者募集中でし！\n";
  const image =
    "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fapex.jpg";
  sendOtherGames(msg, txt, image);
}

function deadByDayLight(msg) {
  const role_id = msg.guild.roles.cache.find((role) => role.name === "DbD");
  const txt =
    role_id.toString() +
    " 【Dead by Daylight募集】\n" +
    `<@${msg.author.id}>` +
    "たんがDbD参加者募集中でし！\n";
  const image =
    "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fdbd.png";
  sendOtherGames(msg, txt, image);
}

function sendOtherGames(msg, txt, image) {
  const channelName = "別ゲー募集";
  if (isNotThisChannel(msg, channelName)) {
    return;
  }
  var strCmd = msg.content.replace(/　/g, " ");
  strCmd = strCmd.replace("  ", " ");
  const args = strCmd.split(" ");
  args.shift();
  if (args[0] == "〆") {
    sendCloseMessage(msg);
  } else {
    if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
    try {
      msg.channel.send({
        content: txt,
        files: [image],
      });
    } catch (error) {
      console.log(error);
    }
  }
}

function sendLeagueMatch(msg, txt, condition, l_args, stageImages) {
  var l_date = l_args[0];
  var l_rule = l_args[1];
  var l_stage = l_args[2];
  var thumbnail_url;
  switch (l_rule) {
    case "ガチエリア":
      thumbnail_url =
        "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png";
      break;
    case "ガチヤグラ":
      thumbnail_url =
        "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.pn";
      break;
    case "ガチホコバトル":
      thumbnail_url =
        "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png";
      break;
    case "ガチアサリ":
      thumbnail_url =
        "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png";
      break;
    default:
      thumbnail_url =
        "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png";
      break;
  }

  const embed = new MessageEmbed()
    .setAuthor({
      name: "リーグマッチ",
      iconURL:
        "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png",
    })
    .setColor(0xf02d7d)
    .addFields(
      {
        name: l_date + "　" + l_rule,
        value: l_stage,
      },
      { name: "参加条件", value: condition }
    )
    .setThumbnail(thumbnail_url);
  const imageEmbedA = new MessageEmbed().setImage(stageImages[0]);
  const imageEmbedB = new MessageEmbed().setImage(stageImages[1]);
  try {
    msg.reply({
      content: txt,
      embeds: [embed, imageEmbedA, imageEmbedB],
    });
  } catch (error) {
    console.log(error);
  }
}

function sendCloseMessage(msg) {
  try {
    const embed = getCloseEmbed(msg);
    msg.channel.send({ embeds: [embed] });
    msg.delete();
  } catch (error) {
    console.log(error);
  }
}
function getCloseEmbed(msg) {
  const stageEmbed = new MessageEmbed();
  stageEmbed.setDescription(`<@${msg.author.id}>たんの募集 〆`);
  return stageEmbed;
}

function isNotThisChannel(msg, channelName) {
  const msgSendedChannelName = msg.channel.name;
  if (!msgSendedChannelName.match(channelName)) {
    msg.reply("このコマンドはこのチャンネルでは使えないでし！");
    return true;
  }
  return false;
}
