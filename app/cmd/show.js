const request = require("request");
const common = require("./common.js");

function sendStageInfo(msg, data, scheduleNum) {
  const l_args = common.getLeague(data, scheduleNum).split(",");
  const g_args = common.getGachi(data, scheduleNum).split(",");
  const l_date = l_args[0];
  const l_rule = l_args[1];
  const l_stage = l_args[2];
  const g_date = g_args[0];
  const g_rule = g_args[1];
  const g_stage = g_args[2];
  var title;
  if (scheduleNum == 0) {
    title = "現在";
  } else {
    title = "次";
  }

  msg.channel.send({
    embed: {
      author: {
        name: title + "のリーグマッチ",
        icon_url:
          "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png",
      },
      color: 0xf02d7d,
      fields: [
        {
          name: l_date + "　" + l_rule,
          value: l_stage,
        },
      ],
      thumbnail: {
        url: "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png",
      },
    },
  });
  msg.channel.send({
    embed: {
      author: {
        name: title + "のガチマッチ",
        icon_url:
          "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png",
      },
      color: 0xf02d7d,
      fields: [
        {
          name: g_date + "　" + g_rule,
          value: g_stage,
        },
      ],
      thumbnail: {
        url: "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png",
      },
    },
  });
}

module.exports = function handleShow(msg, args) {
  request.get(
    "https://splatoon2.ink/data/schedules.json",
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        if (args == `now`) {
          sendStageInfo(msg, data, 0);
        } else if (args == "next") {
          sendStageInfo(msg, data, 1);
        } else if (args == "nawabari") {
          const stage_a =
            "https://splatoon2.ink/assets/splatnet" +
            data.regular[0].stage_a.image;
          const stage_b =
            "https://splatoon2.ink/assets/splatnet" +
            data.regular[0].stage_b.image;
          const date =
            common.unixTime2mdwhm(data.regular[0].start_time) +
            " – " +
            common.unixTime2mdwhm(data.regular[0].end_time);
          const regular_stage =
            common.stage2txt(data.regular[0].stage_a.id) +
            "\n" +
            common.stage2txt(data.regular[0].stage_b.id) +
            "\n";

          msg.channel.send({
            embed: {
              author: {
                name: "レギュラーマッチ",
                icon_url:
                  "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png",
              },
              color: 1693465,
              fields: [
                {
                  name: date,
                  value: regular_stage,
                },
              ],
              thumbnail: {
                url: "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png",
              },
            },
          });
        } else if (msg.content === "show run") {
          request.get(
            "https://splatoon2.ink/data/coop-schedules.json",
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                const data = JSON.parse(body);
                const stage =
                  "https://splatoon2.ink/assets/splatnet" +
                  data.details[0].stage.image;
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

                msg.channel.send({
                  embeds: {
                    author: {
                      name: "SALMON RUN",
                      icon_url:
                        "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png",
                    },
                    title: date,
                    color: 16733696,
                    fields: [
                      {
                        name: "支給ブキ",
                        value: weapons,
                      },
                      {
                        name: "ステージ",
                        value: coop_stage,
                      },
                    ],
                    image: {
                      url: stage,
                    },
                  },
                });
              } else {
                console.log("なんかエラーでてるわ");
              }
            }
          );
        }
      }
    }
  );
};
