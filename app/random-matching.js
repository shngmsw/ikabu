const request = require("request");
const common = require("./common.js");
const Discord = require("discord.js");

module.exports = function handleRandomMatching(msg) {

    if (msg.content.startsWith("randommatch") && msg.channel.name != "botコマンド") {
        nextLeagueMatch(msg);
    }
}

function nextLeagueMatch(msg) {
    const channelName = "ランダムマッチング";
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
        msg.react("👌");
        msg.channel.send(getCloseEmbed(msg));
    } else {
        request.get("https://splatoon2.ink/data/schedules.json", function (
            error,
            response,
            body
        ) {
            if (!error && response.statusCode == 200) {
                const data = JSON.parse(body);
                const l_args = common.getLeague(data, 1).split(",");
                let txt =
                    "@here 【ランダムマッチング】リグマ募集\n" +
                    "✅リアクションで参加表明するでし！\n" +
                    "人数によって4人チームをランダムでマッチングさせるでし！\n" +
                    "マッチングしたら原則欠席はNGでし！\n";
                sendLeagueMatch(msg, txt, l_args);
            } else {
                msg.channel.send("なんかエラーでてるわ");
            }
        });
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

    msg.channel.send(txt, {
        embed: {
            author: {
                name: "リーグマッチ",
                icon_url: "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
            },
            color: 0xf02d7d,
            fields: [{
                name: l_date + "　" + l_rule,
                value: l_stage
            }],
            thumbnail: {
                url: tuhmbnail_url
            }
        }
    }).then((sentMessage) => sentMessage.react("✅"));
    msg.delete();
}

function isNotThisChannel(msg, channelName) {
    const msgSendedChannelName = msg.channel.name;
    if (!msgSendedChannelName.match(channelName)) {
        msg.channel.send("このコマンドはこのチャンネルでは使えないでし！");
        return true;
    }
    return false;
}