const request = require("request");
const common = require("./common.js");

module.exports = {
  handleRecruit: handleRecruit
};

function handleRecruit(msg) {
  if (msg.content.startsWith("fes")) {
    request.get("https://splatoon2.ink/data/festivals.json", function(
      error,
      response,
      body
    ) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const role_id_a = msg.guild.roles.find("name", "ヒメ派");
        const role_id_b = msg.guild.roles.find("name", "イイダ派");
        var teamId = "";
        var strCmd = msg.content.replace(/　/g, " ");
        strCmd = strCmd.replace("  ", " ");
        const args = strCmd.split(" ");
        args.shift();

        if (
          strCmd.startsWith("fes a") ||
          (msg.member.roles.has(role_id_a.id) && args[0] != "b")
        ) {
          teamId = "a";
        } else if (
          strCmd.startsWith("fes b") ||
          (msg.member.roles.has(role_id_b.id) && args[0] != "a")
        ) {
          teamId = "b";
        } else {
          msg.reply(
            `${msg.guild.channels.find("name", "フェス投票所！")}` +
              "で投票してから募集するでし！\nもしくは`fes a`でヒメ派、`fes b`でイイダ派の募集ができるでし！"
          );
        }
        if (teamId === "a") {
          if (strCmd.match("〆")) {
            msg.react("👌");
            msg.guild.channels
              .find("name", "ナワバリ・フェス募集")
              .send("> " + msg.author.username + "たんの募集 〆");
          } else {
            // let txt = '@everyone 【フェス募集：ヒメ派】\n' + msg.author.username + 'たんがフェスメン募集中でし！\n'
            //   + data.jp.festivals[0].names.alpha_short
            //   + '派のみなさん、いかがですか？';
            let txt =
              role_id_a.toString() +
              " 【フェス募集：ヒメ派】\n" +
              msg.author.username +
              "たんがフェスメン募集中でし！\n" +
              data.jp.festivals[0].names.alpha_short +
              "派のみなさん、いかがですか？";
            const date =
              "" +
              common.unixTime2mdwhm(data.jp.festivals[0].times.start) +
              " – " +
              common.unixTime2mdwhm(data.jp.festivals[0].times.end);
            let desc = ">>> [参加条件] ";

            if (strCmd.startsWith("fes a")) {
              args.shift();
            }

            if (args.length > 0) {
              desc += args.join(" ");
            } else {
              desc += "なし";
            }
            const image =
              "https://splatoon2.ink/assets/splatnet" +
              data.jp.festivals[0].images.alpha;
            const title = data.jp.festivals[0].names.alpha_long;
            const color = parseInt(
              common.rgbToHex(
                Math.round(data.jp.festivals[0].colors.alpha.r * 255),
                Math.round(data.jp.festivals[0].colors.alpha.g * 255),
                Math.round(data.jp.festivals[0].colors.alpha.b * 255)
              ),
              16
            );
            msg.guild.channels.find("name", "ナワバリ・フェス募集").send(txt, {
              embed: {
                color: color,
                author: {
                  name: title,
                  icon_url:
                    "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S2_Splatfest_Logo.svg/45px-S2_Splatfest_Logo.svg.png"
                },
                title: desc,
                description: date,
                thumbnail: {
                  url: image
                }
              }
            });
          }
        }

        if (teamId === "b") {
          if (strCmd.match("〆")) {
            msg.react("👌");
            msg.guild.channels
              .find("name", "ナワバリ・フェス募集")
              .send("> " + msg.author.username + "たんの募集 〆");
          } else {
            // let txt = '@everyone 【フェス募集：イイダ派】\n' + msg.author.username + 'たんがフェスメン募集中でし！\n'
            //   + data.jp.festivals[0].names.bravo_short
            //   + '派のみなさん、いかがですか？';
            let txt =
              role_id_b.toString() +
              " 【フェス募集：イイダ派】\n" +
              msg.author.username +
              "たんがフェスメン募集中でし！\n" +
              data.jp.festivals[0].names.bravo_short +
              "派のみなさん、いかがですか？";
            const date =
              "" +
              common.unixTime2mdwhm(data.jp.festivals[0].times.start) +
              " – " +
              common.unixTime2mdwhm(data.jp.festivals[0].times.end);

            let desc = ">>> [参加条件] ";

            if (strCmd.startsWith("fes b")) {
              args.shift();
            }
            if (args.length > 0) {
              desc += args.join(" ");
            } else {
              desc += "なし";
            }
            const image =
              "https://splatoon2.ink/assets/splatnet" +
              data.jp.festivals[0].images.bravo;
            const title = data.jp.festivals[0].names.bravo_long;
            const color = parseInt(
              common.rgbToHex(
                Math.round(data.jp.festivals[0].colors.bravo.r * 255),
                Math.round(data.jp.festivals[0].colors.bravo.g * 255),
                Math.round(data.jp.festivals[0].colors.bravo.b * 255)
              ),
              16
            );
            msg.guild.channels.find("name", "ナワバリ・フェス募集").send(txt, {
              embed: {
                color: color,
                author: {
                  name: title,
                  icon_url:
                    "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S2_Splatfest_Logo.svg/45px-S2_Splatfest_Logo.svg.png"
                },
                title: desc,
                description: date,
                thumbnail: {
                  url: image
                }
              }
            });
          }
        }
      } else {
        msg.channel.send("なんかエラーでてるわ");
      }
    });
  }

  if (msg.content.startsWith("next")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react("👌");
      msg.guild.channels
        .find("name", "リグマ募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      request.get("https://splatoon2.ink/data/schedules.json", function(
        error,
        response,
        body
      ) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const l_args = common.getLeague(data, 1).split(",");
          let txt =
            "@everyone 【リグマ募集】\n" +
            msg.author.username +
            "たんがリグメン募集中でし！\n";
          if (args.length > 0) txt += " " + args.join(" ") + "\n";
          const stage_a =
            "https://splatoon2.ink/assets/splatnet" +
            data.league[1].stage_a.image;
          const stage_b =
            "https://splatoon2.ink/assets/splatnet" +
            data.league[1].stage_b.image;
          sendLeagueMatch(msg, txt, l_args);
          msg.guild.channels
            .find("name", "リグマ募集")
            .send({ files: [stage_a, stage_b] });
        } else {
          msg.channel.send("なんかエラーでてるわ");
        }
      });
    }
  }

  if (msg.content.startsWith("now") || msg.content.startsWith("nou")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react("👌");
      msg.guild.channels
        .find("name", "リグマ募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      request.get("https://splatoon2.ink/data/schedules.json", function(
        error,
        response,
        body
      ) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const l_args = common.getLeague(data, 0).split(",");
          let txt =
            "@everyone 【リグマ募集】\n" +
            msg.author.username +
            "たんがリグメン募集中でし！\n";
          if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ") + "\n";
          const stage_a =
            "https://splatoon2.ink/assets/splatnet" +
            data.league[0].stage_a.image;
          const stage_b =
            "https://splatoon2.ink/assets/splatnet" +
            data.league[0].stage_b.image;
          sendLeagueMatch(msg, txt, l_args);
          msg.guild.channels
            .find("name", "リグマ募集")
            .send({ files: [stage_a, stage_b] });
        } else {
          msg.channel.send("なんかエラーでてるわ");
        }
      });
    }
  }

  if (msg.content.startsWith("nawabari")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react("👌");
      msg.guild.channels
        .find("name", "ナワバリ・フェス募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      request.get("https://splatoon2.ink/data/schedules.json", function(
        error,
        response,
        body
      ) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const stage_a =
            "https://splatoon2.ink/assets/splatnet" +
            data.regular[0].stage_a.image;
          const stage_b =
            "https://splatoon2.ink/assets/splatnet" +
            data.regular[0].stage_b.image;
          let txt =
            "@everyone 【ナワバリ募集】\n" +
            msg.author.username +
            "たんがナワバリ中でし！\n";
          if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ") + "\n";
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

          msg.guild.channels.find("name", "ナワバリ・フェス募集").send(txt, {
            embed: {
              author: {
                name: "レギュラーマッチ",
                icon_url:
                  "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
              },
              color: 1693465,
              fields: [
                {
                  name: date,
                  value: regular_stage
                }
              ],
              thumbnail: {
                url:
                  "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
              }
            }
          });
          msg.guild.channels
            .find("name", "ナワバリ・フェス募集")
            .send({ files: [stage_a, stage_b] });
        } else {
          msg.channel.send("なんかエラーでてるわ");
        }
      });
    }
  }

  if (msg.content.startsWith("run")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react("👌");
      msg.guild.channels
        .find("name", "サーモン募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      request.get("https://splatoon2.ink/data/coop-schedules.json", function(
        error,
        response,
        body
      ) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const stage =
            "https://splatoon2.ink/assets/splatnet" +
            data.details[0].stage.image;
          let txt =
            "@everyone 【バイト募集】\n" +
            msg.author.username +
            "たんがバイト中でし！\n";
          if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ") + "\n";
          txt += "よければ合流しませんか？";
          const date =
            common.unixTime2mdwhm(data.details[0].start_time) +
            " – " +
            common.unixTime2mdwhm(data.details[0].end_time);
          const coop_stage =
            common.coop_stage2txt(data.details[0].stage.image) + "\n";
          const weapons =
            (data.details[0].weapons[0]
              ? common.weapon2txt(data.details[0].weapons[0].id)
              : "？") +
            "・" +
            (data.details[0].weapons[1]
              ? common.weapon2txt(data.details[0].weapons[1].id)
              : "？") +
            "・" +
            (data.details[0].weapons[2]
              ? common.weapon2txt(data.details[0].weapons[2].id)
              : "？") +
            "・" +
            (data.details[0].weapons[3]
              ? common.weapon2txt(data.details[0].weapons[3].id)
              : "？");

          msg.guild.channels.find("name", "サーモン募集").send(txt, {
            embed: {
              author: {
                name: "SALMON RUN",
                icon_url:
                  "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png"
              },
              title: date,
              color: 16733696,
              fields: [
                {
                  name: weapons,
                  value: coop_stage
                }
              ],
              image: {
                url: stage
              }
            }
          });
        } else {
          msg.channel.send("なんかエラーでてるわ");
        }
      });
    }
  }

  if (msg.content.startsWith("fn")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react("👌");
      msg.guild.channels
        .find("name", "別ゲー募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      const role_id = msg.guild.roles.find("name", "建築士");
      let txt =
        role_id.toString() +
        " 【Fortnite募集】\n" +
        msg.author.username +
        "たんがFortniteメンバー募集中でし！\n";
      if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集").send(txt, {
        files: [
          "https://cdn.glitch.com/6b791a64-15a8-4732-9fc4-9e01d48213be%2Ffortnite.jpg"
        ]
      });
    }
  }

  if (msg.content.startsWith("mk")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react("👌");
      msg.guild.channels
        .find("name", "別ゲー募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      const role_id = msg.guild.roles.find("name", "走り屋");
      let txt =
        role_id.toString() +
        "  【マリオカート募集】\n" +
        msg.author.username +
        "たんがマリオカート参加者募集中でし！\n";
      if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集").send(txt, {
        files: [
          "https://cdn.glitch.com/6b791a64-15a8-4732-9fc4-9e01d48213be%2Fmk.png"
        ]
      });
    }
  }

  if (msg.content.startsWith("mc")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.guild.channels
        .find("name", "別ゲー募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      let txt =
        "@everyone 【MINECRAFT募集】\n" +
        msg.author.username +
        "たんがMINECRAFT参加者募集中でし！\n";
      if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集").send(txt, {
        files: [
          "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2FMinecraft.jpg"
        ]
      });
    }
  }

  if (msg.content.startsWith("oc")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react("👌");
      msg.guild.channels
        .find("name", "別ゲー募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      let txt =
        "@everyone 【オーバークック2募集】\n" +
        msg.author.username +
        "たんがオーバークック2参加者募集中でし！\n";
      if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集").send(txt, {
        files: [
          "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fovercook.jpg"
        ]
      });
    }
  }

  if (msg.content.startsWith("sb")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react("👌");
      msg.guild.channels
        .find("name", "別ゲー募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      const role_id = msg.guild.roles.find("name", "ファイター");
      let txt =
        role_id.toString() +
        " 【スマブラSP募集】\n" +
        msg.author.username +
        "たんがスマブラSP参加者募集中でし！\n";
      if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集").send(txt, {
        files: [
          "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fsmash.jpg"
        ]
      });
    }
  }
  if (msg.content.startsWith("!dbd")) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react("👌");
      msg.guild.channels
        .find("name", "別ゲー募集")
        .send("> " + msg.author.username + "たんの募集 〆");
    } else {
      const role_id = msg.guild.roles.find("name", "DbD");
      let txt =
        role_id.toString() +
        " 【Dead by Daylight募集】\n" +
        msg.author.username +
        "たんがDbD参加者募集中でし！\n";
      if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集").send(txt, {
        files: [
          "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fdbd.png"
        ]
      });
    }
  }
}

function sendLeagueMatch(msg, txt, l_args) {
  var l_date = l_args[0];
  var l_rule = l_args[1];
  var l_stage = l_args[2];
  var tuhmbnail_url;

  if (l_rule == "ガチエリア") {
    tuhmbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png";
  } else if (l_rule == "ガチヤグラ") {
    tuhmbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png";
  } else if (l_rule == "ガチホコバトル") {
    tuhmbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png";
  } else if (l_rule == "ガチアサリ") {
    tuhmbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png";
  } else {
    tuhmbnail_url =
      "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png";
  }

  msg.guild.channels.find("name", "リグマ募集").send(txt, {
    embed: {
      author: {
          name: msg.author.username + "のリーグマッチ募集",
          icon_url: msg.author.avatarURL
      },
      // author: {
      //   name: "リーグマッチ",
      //   icon_url:
      //     "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
      // },
      color: 0xf02d7d,
      fields: [
        {
          name: l_date + "　" + l_rule,
          value: l_stage
        }
      ],
      thumbnail: {
        url: tuhmbnail_url
      }
    }
  });
}
