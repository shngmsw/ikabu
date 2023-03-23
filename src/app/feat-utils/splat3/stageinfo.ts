// @ts-expect-error TS(6200): Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const {
  getLeagueList,
  getAnarchyList,
  getXMatchList,
  getAnarchyChallengeData,
  getAnarchyOpenData,
  getLeagueData,
  getXMatchData,
  checkFes,
  fetchSchedule,
  // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require("../../common/apis/splatoon3_ink");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Discord'.
const Discord = require("discord.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'formatDate... Remove this comment to see the full error message
const {
  formatDatetime,
  dateformat,
} = require("../../common/convert_datetime.js");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger("interaction");

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = function handleStageInfo(msg: $TSFixMe) {
  if (msg.content.startsWith("stageinfo")) {
    stageinfo(msg);
  } else if (msg.content.startsWith("stage")) {
    sf(msg);
  }
};
async function sf(msg: $TSFixMe) {
  try {
    const data = await fetchSchedule();

    // const embedStr_league = await getLeagueEmbed(data);
    // embedStr_league.setAuthor({
    //     name: 'リーグマッチ',
    //     iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/league_icon.png',
    // });
    // embedStr_league.setColor('#ED2D7C');

    const embedStr_challenge = await getACEmbed(data);
    embedStr_challenge.setAuthor({
      name: "バンカラマッチ (チャレンジ)",
      iconURL:
        "https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png",
    });
    embedStr_challenge.setColor("#F54910");

    const embedStr_open = await getAOEmbed(data);
    embedStr_open.setAuthor({
      name: "バンカラマッチ (オープン)",
      iconURL:
        "https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png",
    });
    embedStr_open.setColor("#F54910");

    const embedStr_x = await getXMatchEmbed(data);
    embedStr_x.setAuthor({
      name: "Xマッチ",
      iconURL:
        "https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/x_match_icon.png",
    });
    embedStr_x.setColor("#0edb9b");
    // msg.channel.send({
    //     embeds: [embedStr_x, embedStr_challenge, embedStr_open, embedStr_league],
    // });

    // TODO リグマ追加時に表示
    msg.channel.send({
      embeds: [embedStr_x, embedStr_challenge, embedStr_open],
    });
  } catch (error) {
    msg.channel.send("なんかエラーでてるわ");
    logger.error(error);
  }
}

async function stageinfo(msg: $TSFixMe) {
  // 過去分は削除
  msgDelete(msg);

  try {
    sf(msg);
  } catch (error) {
    msg.channel.send("なんかエラーでてるわ");
    logger.error(error);
  }
}

async function getLeagueEmbed(data: $TSFixMe) {
  const stageEmbed = new Discord.EmbedBuilder().setTitle("ステージ情報");
  const num = getLeagueList(data.schedule).length;
  for (let i = 0; i < num; i++) {
    let league_data = await getLeagueData(data, i);
    let stage;
    let rule;
    if (checkFes(data.schedule, i)) {
      rule = "フェス期間中";
      stage = "フェス期間中はお休みでし";
    } else {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      rule = league_data.rule;
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      stage = league_data.stage1 + "／" + league_data.stage2;
    }

    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const league_start_date = formatDatetime(
      league_data.startTime,
      dateformat.ymdwhm
    );
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const league_end_date = formatDatetime(league_data.endTime, dateformat.hm);
    let name = league_start_date + "-" + league_end_date + " 【" + rule + "】";
    stageEmbed.addFields([{ name: name, value: stage }]);
  }
  stageEmbed.setTimestamp();
  stageEmbed.setFooter({ text: "StageInfo by splatoon3.ink" });
  return stageEmbed;
}

async function getAOEmbed(data: $TSFixMe) {
  const stageEmbed = new Discord.EmbedBuilder().setTitle("ステージ情報");
  const num = getAnarchyList(data.schedule).length;
  for (let i = 0; i < num; i++) {
    let anarchy_data = await getAnarchyOpenData(data, i);
    let stage;
    let rule;
    if (checkFes(data.schedule, i)) {
      rule = "フェス期間中";
      stage = "フェス期間中はお休みでし";
    } else {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      rule = anarchy_data.rule;
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      stage = anarchy_data.stage1 + "／" + anarchy_data.stage2;
    }
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const anarchy_start_date = formatDatetime(
      anarchy_data.startTime,
      dateformat.ymdwhm
    );
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const anarchy_end_date = formatDatetime(
      anarchy_data.endTime,
      dateformat.hm
    );
    let name =
      anarchy_start_date + "-" + anarchy_end_date + " 【" + rule + "】";
    stageEmbed.addFields([{ name: name, value: stage }]);
  }
  stageEmbed.setTimestamp();
  stageEmbed.setFooter({ text: "StageInfo by splatoon3.ink" });
  return stageEmbed;
}

async function getACEmbed(data: $TSFixMe) {
  const stageEmbed = new Discord.EmbedBuilder().setTitle("ステージ情報");
  const num = getAnarchyList(data.schedule).length;
  for (let i = 0; i < num; i++) {
    let anarchy_data = await getAnarchyChallengeData(data, i);
    let stage;
    let rule;
    if (checkFes(data.schedule, i)) {
      rule = "フェス期間中";
      stage = "フェス期間中はお休みでし";
    } else {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      rule = anarchy_data.rule;
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      stage = anarchy_data.stage1 + "／" + anarchy_data.stage2;
    }
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const anarchy_start_date = formatDatetime(
      anarchy_data.startTime,
      dateformat.ymdwhm
    );
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const anarchy_end_date = formatDatetime(
      anarchy_data.endTime,
      dateformat.hm
    );
    let name =
      anarchy_start_date + "-" + anarchy_end_date + " 【" + rule + "】";
    stageEmbed.addFields([{ name: name, value: stage }]);
  }
  stageEmbed.setTimestamp();
  stageEmbed.setFooter({ text: "StageInfo by splatoon3.ink" });
  return stageEmbed;
}

async function getXMatchEmbed(data: $TSFixMe) {
  const stageEmbed = new Discord.EmbedBuilder().setTitle("ステージ情報");
  const num = getXMatchList(data.schedule).length;
  for (let i = 0; i < num; i++) {
    let x_data = await getXMatchData(data, i);
    let stage;
    let rule;
    if (checkFes(data.schedule, i)) {
      rule = "フェス期間中";
      stage = "フェス期間中はお休みでし";
    } else {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      rule = x_data.rule;
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      stage = x_data.stage1 + "／" + x_data.stage2;
    }
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const xstart_date = formatDatetime(x_data.startTime, dateformat.ymdwhm);
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const x_end_date = formatDatetime(x_data.endTime, dateformat.hm);
    let name = xstart_date + "-" + x_end_date + " 【" + rule + "】";
    stageEmbed.addFields([{ name: name, value: stage }]);
  }
  stageEmbed.setTimestamp();
  stageEmbed.setFooter({ text: "StageInfo by splatoon3.ink" });
  return stageEmbed;
}

async function msgDelete(message: $TSFixMe) {
  // コマンドが送信されたチャンネルから直近100件(上限)メッセージを取得する
  const messages = await message.channel.messages.fetch({ limit: 100 });
  // それらのメッセージを一括削除
  message.channel.bulkDelete(messages);
}
