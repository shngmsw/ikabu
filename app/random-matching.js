const request = require("request");
const common = require("./common.js");
const Discord = require("discord.js");
const TEAM_MEMBER_NUM = 4;
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
                    "リグマのルール変更時間の30分前から5分前まで募集\n" +
                    "5分前時点で参加人数が4人以上の場合、4人ずつのチームにランダムで振り分けるでし！\n" +
                    "マッチングしたら原則欠席はNGでし！\nβ版なのでウデマエとVC有無は考慮せずにランダムで振り分けるのでエンジョイで楽しめる人のみ参加してほしいでし！\n" +
                    "✅リアクションで参加表明するでし！\n";
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
    }).then((sentMessage) => {
        msg.delete();
        sentMessage.react('✅');
        const filter = (reaction, user) => {
            return reaction.emoji.name === '✅';
        };

        const collector = sentMessage.createReactionCollector(filter, { time: 1500000 });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        });

        collector.on('end', collected => {
            let userList = [];

            collected.forEach(function (value) {
                value.users.cache.forEach(function (user) {
                    if (user.bot == false) {
                        userList.push(user.id);
                    }
                });
            });

            if (userList.length < TEAM_MEMBER_NUM) {
                sentMessage.channel.send('4人以上集まらなかったでし…');
                sentMessage.reactions.removeAll().catch();
                return;
            }

            let teamList = [];

            let teamNum = Math.floor(userList.length / TEAM_MEMBER_NUM);
            for (let i = 0; i < teamNum; i++) {
                let team = [];
                for (let j = 0; j < TEAM_MEMBER_NUM; j++) {
                    let randomNum = Math.floor(Math.random() * userList.length);
                    const member = userList[randomNum];
                    team.push(member);
                    userList.splice(randomNum, 1);
                }
                teamList.push(team);
            }

            let fieldsList = [];
            let mentionList = [];
            fieldsList.push({
                name: l_date + "　" + l_rule,
                value: l_stage
            });

            for (let i = 0; i < teamNum; i++) {
                fieldsList.push({
                    name: `Team ${i + 1}`,
                    value: `★<@${teamList[i][0]}> <@${teamList[i][1]}> <@${teamList[i][2]}> <@${teamList[i][3]}>`
                });
                mentionList.push(`<@${teamList[i][0]}>`);
                mentionList.push(`<@${teamList[i][1]}>`);
                mentionList.push(`<@${teamList[i][2]}>`);
                mentionList.push(`<@${teamList[i][3]}>`);
            }

            let matchResultEmbed = new Discord.MessageEmbed()
                .setTitle('ランダムマッチング結果')
                .setColor(0x008080)
                .setDescription('マッチングしたチームは空いているボイスチャンネルに入り、リグマを始めるでし！\nリグマ開始までの進行は★がついている人がリードしてくれるとありがたいでし！')
                .thumbnail(tuhmbnail_url)
                .addFields(fieldsList);

            sentMessage.channel.send(mentionList.join(','), { embed: matchResultEmbed });
            sentMessage.delete();
        });
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
