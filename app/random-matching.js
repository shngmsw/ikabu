const request = require("request");
const common = require("./common.js");
const Discord = require("discord.js");
const messageInsert = require("../db/rm_insert.js");
const reactionInsert = require("../db/rmr_insert.js");
const reactionDelete = require("../db/rmr_delete.js");
const getReactionUsers = require("../db/rmr_select.js");
const getRandomMatchingReactions = require("../db/rm_select.js");
const deleteRandomMatching = require("../db/rm_delete.js");

var l_date;
var l_rule;
var l_stage;
var tuhmbnail_url;


const TEAM_MEMBER_NUM = process.env.TEAM_MEMBER_NUM;
module.exports = {
    handleRandomMatching,
    announcementResult,
    reactionUserInsert,
    reactionUserDelete
}

function handleRandomMatching(msg) {
    if (msg.content.startsWith("randommatch") && msg.channel.name != "botコマンド") {
        randomMatching(msg);
    }
}

async function announcementResult(msg) {
    if (msg.content.startsWith("randommatchresult") && msg.channel.name != "botコマンド") {
        const messageId = await getRandomMatchingReactions();
        if (messageId.length == 0) return;
        let result = await getReactionUsers(messageId[0]['message_id']);
        let userList = [];
        for (var data of result) {
            userList.push(data['user_id']);
        }
        let recruitMessage = await msg.channel.messages.fetch(messageId[0]['message_id']);
        msg.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });
        randomGrouping(recruitMessage, userList);
    }
}

function reactionUserInsert(message, userId) {
    reactionInsert(message.id, userId);
}

function reactionUserDelete(message, userId) {
    reactionDelete.deleteRandomMatchingReactionsUser(message.id, userId);
}

function randomMatching(msg) {
    const channelName = "ランダムマッチング";
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    request.get("https://splatoon2.ink/data/schedules.json", function (
        error,
        response,
        body
    ) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            const l_args = common.getLeague(data, 1).split(",");
            let txt =
                "@everyone 【ランダムマッチング】リグマ募集\n" +
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

function sendLeagueMatch(msg, txt, l_args) {
    l_date = l_args[0];
    l_rule = l_args[1];
    l_stage = l_args[2];

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
    }).then(async (sentMessage) => {
        msg.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });

        sentMessage.react('✅');

        const messageId = sentMessage.id;
        await reactionDelete.deleteRandomMatchingReactions();
        await deleteRandomMatching();
        await messageInsert(messageId);

        const filter = (reaction, user) => {
            return reaction.emoji.name === '✅';
        };

        const collector = sentMessage.createReactionCollector(filter, { time: 1500000 });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
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

async function randomGrouping(sentMessage, userList) {
    console.log(`TEAM_MEMBER_NUM:${TEAM_MEMBER_NUM}`);
    console.log(`userlist.length:${userList.length}`);
    if (userList.length < TEAM_MEMBER_NUM) {
        sentMessage.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });
        // データ削除
        await reactionDelete.deleteRandomMatchingReactions();
        await deleteRandomMatching();

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
        .addFields(fieldsList);
    sentMessage.channel.send(mentionList.join(','), { embed: matchResultEmbed });
    sentMessage.delete().catch(error => {
        // Only log the error if it is not an Unknown Message error
        if (error.code !== 10008) {
            console.error('Failed to delete the message:', error);
        }
    });
    // データ削除
    await reactionDelete.deleteRandomMatchingReactions();
    await deleteRandomMatching();

}