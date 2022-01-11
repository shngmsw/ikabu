const request = require("request");
const common = require("../common.js");
const Discord = require("discord.js");

module.exports = function handleRecruit(msg) {
    if (msg.content.startsWith("next") && msg.channel.name != "botコマンド") {
        nextLeagueMatch(msg);
    }
    if (msg.content.startsWith("now") || msg.content.startsWith("nou")) {
        nowLeagueMatch(msg);
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

function nextLeagueMatch(msg) {
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
        request.get(
            "https://splatoon2.ink/data/schedules.json",
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const data = JSON.parse(body);
                    const l_args = common.getLeague(data, 1).split(",");
                    let txt =
                        "@everyone 【リグマ募集】\n" +
                        `<@${msg.author.id}>` +
                        "たんがリグメン募集中でし！\n";
                    if (args.length > 0) txt += "[参加条件] " + args.join(" ") + "\n";
                    const stage_a =
                        "https://splatoon2.ink/assets/splatnet" +
                        data.league[1].stage_a.image;
                    const stage_b =
                        "https://splatoon2.ink/assets/splatnet" +
                        data.league[1].stage_b.image;
                    const stageImages = [stage_a, stage_b];
                    sendLeagueMatch(msg, txt, l_args, stageImages);
                } else {
                    msg.channel.send("なんかエラーでてるわ");
                }
            }
        );
    }
}

function nowLeagueMatch(msg) {
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
        request.get(
            "https://splatoon2.ink/data/schedules.json",
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const data = JSON.parse(body);
                    const l_args = common.getLeague(data, 0).split(",");
                    let txt =
                        "@everyone 【リグマ募集】\n" +
                        `<@${msg.author.id}>` +
                        "たんがリグメン募集中でし！\n";
                    if (args.length > 0) txt += "[参加条件] " + args.join(" ") + "\n";
                    const stage_a =
                        "https://splatoon2.ink/assets/splatnet" +
                        data.league[0].stage_a.image;
                    const stage_b =
                        "https://splatoon2.ink/assets/splatnet" +
                        data.league[0].stage_b.image;
                    const stageImages = [stage_a, stage_b];
                    sendLeagueMatch(msg, txt, l_args, stageImages);
                } else {
                    msg.channel.send("なんかエラーでてるわ");
                }
            }
        );
    }
}

function regularMatch(msg) {
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
        request.get(
            "https://splatoon2.ink/data/schedules.json",
            function (error, response, body) {
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
                        `<@${msg.author.id}>` +
                        "たんがナワバリ中でし！\n";
                    if (args.length > 0) txt += "[参加条件] " + args.join(" ") + "\n";
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

                    msg.channel.send({
                        content: txt,
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
                        files: [stage_a, stage_b]
                    });
                } else {
                    msg.channel.send("なんかエラーでてるわ");
                }
            }
        );
    }
}

function salmonRun(msg) {
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
        request.get(
            "https://splatoon2.ink/data/coop-schedules.json",
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const data = JSON.parse(body);
                    const stage =
                        "https://splatoon2.ink/assets/splatnet" +
                        data.details[0].stage.image;
                    let txt =
                        "@everyone 【バイト募集】\n" +
                        `<@${msg.author.id}>` +
                        "たんがバイト中でし！\n";
                    if (args.length > 0) txt += "[参加条件] " + args.join(" ") + "\n";
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

                    msg.channel.send({
                        content: txt,
                        embed: {
                            author: {
                                name: "SALMON RUN",
                                icon_url:
                                    "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png",
                            },
                            title: date,
                            color: 16733696,
                            fields: [
                                {
                                    name: weapons,
                                    value: coop_stage,
                                },
                            ],
                            image: {
                                url: stage,
                            },
                        },
                    });
                } else {
                    msg.channel.send("なんかエラーでてるわ");
                }
            }
        );
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
    const image = "https://cdn.glitch.com/10652966-57f9-4b23-8909-a9d93dfe6d26%2Fmhrize-title.jpeg";
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
    const image = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fapex.jpg";
    sendOtherGames(msg, txt, image);
}

function deadByDayLight(msg) {
    const role_id = msg.guild.roles.cache.find((role) => role.name === "DbD");
    const txt = role_id.toString() +
        " 【Dead by Daylight募集】\n" +
        `<@${msg.author.id}>` +
        "たんがDbD参加者募集中でし！\n";
    const image = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fdbd.png";
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
        msg.channel.send({
            content: txt,
            files: [
                image,
            ],
        });
    }
}

function sendLeagueMatch(msg, txt, l_args, stageImages) {
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

    msg.channel.send({
        content: txt,
        embeds: {
            author: {
                name: "リーグマッチ",
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
                url: tuhmbnail_url,
            },
        },
        files: stageImages
    });
}

function sendCloseMessage(msg) {
    const embed = getCloseEmbed(msg);
    msg.channel.send({ embeds: [embed] });
}
function getCloseEmbed(msg) {
    const stageEmbed = new Discord.MessageEmbed();
    stageEmbed.setDescription(`<@${msg.author.id}>たんの募集 〆`);
    return stageEmbed;
}

function isNotThisChannel(msg, channelName) {
    const msgSendedChannelName = msg.channel.name;
    if (!msgSendedChannelName.match(channelName)) {
        msg.channel.send("このコマンドはこのチャンネルでは使えないでし！");
        return true;
    }
    return false;
}
