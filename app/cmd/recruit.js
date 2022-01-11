const request = require("request");
const common = require("../common.js");
const Discord = require("discord.js");

module.exports = function handleRecruit(msg) {

    if (msg.content.startsWith("fes")) {
        festival(msg);
    }

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
        deadByDayLight(msg)
    }
}

function festival(msg) {
    const channelName = "ナワバリ・フェス募集";
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    request.get("https://splatoon2.ink/data/festivals.json", function (
        error,
        response,
        body
    ) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            const role_id_a = msg.guild.roles.cache.find(role => role.name === "ヒメ派");
            const role_id_b = msg.guild.roles.cache.find(role => role.name === "イイダ派");
            var teamId = "";
            var strCmd = msg.content.replace(/　/g, " ");
            strCmd = strCmd.replace("  ", " ");
            const args = strCmd.split(" ");
            args.shift();

            if (
                strCmd.startsWith("fes a") ||
                (msg.member.roles.cache.has(role_id_a.id) && args[0] != "b")
            ) {
                teamId = "a";
            } else if (
                strCmd.startsWith("fes b") ||
                (msg.member.roles.cache.has(role_id_b.id) && args[0] != "a")
            ) {
                teamId = "b";
            } else {
                msg.reply(
                    `${msg.guild.channels.cache.find(channel => channel.name === "フェス投票所！")}` +
                    "で投票してから募集するでし！\nもしくは`fes a`でヒメ派、`fes b`でイイダ派の募集ができるでし！"
                );
            }
            if (teamId === "a") {
                if (strCmd.match("〆")) {
                    msg.react("👌");
                    msg.channel.send(getCloseEmbed(msg));
                } else {
                    let txt =
                        role_id_a.toString() +
                        " 【フェス募集：ヒメ派】\n" +
                        `<@${msg.author.id}>` +
                        "たんがフェスメン募集中でし！\n" +
                        data.jp.festivals[0].names.alpha_short +
                        "派のみなさん、いかがですか？";
                    const date =
                        "" +
                        common.unixTime2mdwhm(data.jp.festivals[0].times.start) +
                        " – " +
                        common.unixTime2mdwhm(data.jp.festivals[0].times.end);
                    let desc = "[参加条件] ";

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
                    msg.channel.send(txt, {
                        embed: {
                            color: color,
                            author: {
                                name: title,
                                icon_url: "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S2_Splatfest_Logo.svg/45px-S2_Splatfest_Logo.svg.png"
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
                    msg.channel.send(getCloseEmbed(msg));
                } else {
                    let txt =
                        role_id_b.toString() +
                        " 【フェス募集：イイダ派】\n" +
                        `<@${msg.author.id}>` +
                        "たんがフェスメン募集中でし！\n" +
                        data.jp.festivals[0].names.bravo_short +
                        "派のみなさん、いかがですか？";
                    const date =
                        "" +
                        common.unixTime2mdwhm(data.jp.festivals[0].times.start) +
                        " – " +
                        common.unixTime2mdwhm(data.jp.festivals[0].times.end);

                    let desc = "[参加条件] ";

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
                    msg.channel.send(txt, {
                        embed: {
                            color: color,
                            author: {
                                name: title,
                                icon_url: "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S2_Splatfest_Logo.svg/45px-S2_Splatfest_Logo.svg.png"
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
                sendLeagueMatch(msg, txt, l_args);
                msg.channel.send({ files: [stage_a, stage_b] });
            } else {
                msg.channel.send("なんかエラーでてるわ");
            }
        });
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
                sendLeagueMatch(msg, txt, l_args);
                msg.channel.send({ files: [stage_a, stage_b] });
            } else {
                msg.channel.send("なんかエラーでてるわ");
            }
        });
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

                msg.channel.send(txt, {
                    embed: {
                        author: {
                            name: "レギュラーマッチ",
                            icon_url: "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
                        },
                        color: 1693465,
                        fields: [{
                            name: date,
                            value: regular_stage
                        }],
                        thumbnail: {
                            url: "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
                        }
                    }
                });
                msg.channel.send({ files: [stage_a, stage_b] });
            } else {
                msg.channel.send("なんかエラーでてるわ");
            }
        });
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
        msg.react("👌");
        msg.channel.send(getCloseEmbed(msg));
    } else {
        request.get("https://splatoon2.ink/data/coop-schedules.json", function (
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
                    `<@${msg.author.id}>` +
                    "たんがバイト中でし！\n";
                if (args.length > 0) txt += "[参加条件] " + args.join(" ") + "\n";
                txt += "よければ合流しませんか？";
                const date =
                    common.unixTime2mdwhm(data.details[0].start_time) +
                    " – " +
                    common.unixTime2mdwhm(data.details[0].end_time);
                const coop_stage = common.coop_stage2txt(data.details[0].stage.image) + "\n";
                const weapons =
                    common.weapon2txt(data.details[0].weapons[0].id) + "・" +
                    common.weapon2txt(data.details[0].weapons[1].id) + "・" +
                    common.weapon2txt(data.details[0].weapons[2].id) + "・" +
                    common.weapon2txt(data.details[0].weapons[3].id);

                msg.channel.send(txt, {
                    embed: {
                        author: {
                            name: "SALMON RUN",
                            icon_url: "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png"
                        },
                        title: date,
                        color: 16733696,
                        fields: [{
                            name: weapons,
                            value: coop_stage
                        }],
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

function monsterHunterRize(msg) {
    const channelName = "別ゲー募集";
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
        msg.react("👌");
        msg.channel.send(getCloseEmbed(msg));
    } else {
        const role_id = msg.guild.roles.cache.find(role => role.name === "ハンター");
        let txt =
            role_id.toString() +
            " 【モンハンライズ募集】\n" +
            `<@${msg.author.id}>` +
            "たんがモンハンライズ参加者募集中でし！\n";
        if (args.length > 0) txt += "[参加条件] " + args.join(" ");
        msg.channel.send(txt, {
            files: [
                "https://cdn.glitch.com/10652966-57f9-4b23-8909-a9d93dfe6d26%2Fmhrize-title.jpeg"
            ]
        });
    }
}

function apexLegends(msg) {
    const channelName = "別ゲー募集";
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
        msg.react("👌");
        msg.channel.send(getCloseEmbed(msg));
    } else {
        const role_id = msg.guild.roles.cache.find(role => role.name === "レジェンド");
        let txt =
            role_id.toString() +
            " 【ApexLegends募集】\n" +
            `<@${msg.author.id}>` +
            "たんがApexLegendsの参加者募集中でし！\n";
        if (args.length > 0) txt += "[参加条件] " + args.join(" ");
        msg.channel.send(txt, {
            files: [
                "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fapex.jpg"
            ]
        });
    }
}

function deadByDayLight(msg) {
    const channelName = "別ゲー募集";
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
        msg.react("👌");
        msg.channel.send(getCloseEmbed(msg));
    } else {
        const role_id = msg.guild.roles.cache.find(role => role.name === "DbD");
        let txt =
            role_id.toString() +
            " 【Dead by Daylight募集】\n" +
            `<@${msg.author.id}>` +
            "たんがDbD参加者募集中でし！\n";
        if (args.length > 0) txt += ">>> [参加条件] " + args.join(" ");
        msg.channel.send(txt, {
            files: [
                "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fdbd.png"
            ]
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
    });
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