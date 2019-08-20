const Combinatorics = require('js-combinatorics');
const wiki = require('wikijs').default;
const common = require('./common.js');
const help = require('./help.js');
const request = require("request");
const recruit = require("./recruit.js");
const ytdl = require('ytdl-core');
const Discord = require("discord.js");
const client = new Discord.Client();

module.exports = {
    call: call
}

function call(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'wiki':
            handleWiki(msg, args[0]);
            break;
        case 'kansen':
            handleKansen(msg, args[0]);
            break;
        case 'timer':
            handleTimer(msg, args[0]);
            break;
        case 'pick':
            handlePick(msg);
            break;
        case 'vpick':
            handleVoicePick(msg);
            break;
        case 'poll':
            handlePoll(msg);
            break;
        case 'rule':
            handleRule(msg);
            break;
        case 'sub':
            handleSub(msg);
            break;
        case 'special':
            handleSpecial(msg);
            break;
        case 'buki':
            handleBuki(msg);
            break;
        case 'fes':
        case 'now':
        case 'nou':
        case 'next':
        case 'run':
        case 'nawabari':
        case 'fn':
        case 'mk':
        case 'mc':
        case 'oc':
        case 'sb':
            recruit.handleRecruit(msg);
            break;
        case 'show':
            handleShow(msg, args[0]);
            break;
        case 'help':
            help.handleHelp(msg);
            break;
        case '!ban':
            handleBan(msg);
            break;
        case '!id':
            handleIDCheck(msg);
            break;
        case '!cc':
            handleCreateChannel(msg);
            break;
    }
}

function handleWiki(msg, word) {
    let wikipedia = wiki({ apiUrl: 'http://ja.wikipedia.org/w/api.php' });

    wikipedia.search(word).then(data => {
        wikipedia
            .page(data.results[0])
            .then(page => page.summary())
            .then(value => msg.channel.send('```' + value + '```'));
        wikipedia.page(data.results[0]).then(page => page.url()).then(value => msg.channel.send(value));
    });
}

function handleKansen(msg, args) {
    var how_many_times = Number(args);
    var resultList = new Array();
    var cmb = Combinatorics.combination(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 2);
    var tmp_watching_list = cmb.toArray();
    var result = '';

    for (let i = 0; i < how_many_times; i++) {
        // next watchersが一人になったらリストを再生成
        if (tmp_watching_list.length <= 1) {
            var baseNum = 0;
            var choose_comb = tmp_watching_list[baseNum];
            resultList.push('`' + (i + 1) + '回目：' + choose_comb + '`');
            var tmp_watching_list = cmb.toArray();
        } else {
            var baseNum = Math.floor(Math.random() * tmp_watching_list.length);
            var choose_comb = tmp_watching_list[baseNum];

            resultList.push('`' + (i + 1) + '回目：' + choose_comb + '`');

            console.log('\n== now watchers ==');
            console.log(resultList);
            console.log('\n== next watchers ==');
            // now watching usersをnext watchersから取り除く
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players) {
                if (players[0] != choose_comb[0]) {
                    return players;
                }
            });
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players) {
                if (players[1] != choose_comb[0]) {
                    return players;
                }
            });
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players) {
                if (players[0] != choose_comb[1]) {
                    return players;
                }
            });
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players) {
                if (players[1] != choose_comb[1]) {
                    return players;
                }
            });
            console.log(tmp_watching_list);
        }
    }
    msg.channel.send(resultList);
}

function handleTimer(msg, args) {
    var kazu = Number(args);
    var count = kazu;
    if (count <= 10 && count > 0 && common.isInteger(kazu)) {
        msg.reply('タイマーを' + count + '分後にセットしたでし！');
        var countdown = function() {
            count--;
            if (count != 0) {
                msg.reply('残り' + count + '分でし');
            } else {
                msg.reply('時間でし！');
            }
        };
        var id = setInterval(function() {
            countdown();
            if (count <= 0) {
                clearInterval(id);
            }
        }, 60000);
    } else {
        msg.reply('10分以内しか入力できないでし！正の整数以外もダメでし！');
    }
}

function handlePick(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = msg.content.replace(/\r?\n/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    // Math.random() * ( 最大値 - 最小値 ) + 最小値;
    var picked = args[Math.floor(Math.random() * args.length)];
    var kazu = Number(args[0]);
    if (kazu) {
        args.shift();
        var picked = random(args, kazu).join('\n');
    } else {
        var picked = args[Math.floor(Math.random() * args.length)];
    }
    msg.channel.send(picked + 'でし！');
}

function handleVoicePick(msg) {
    // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
    // 数字なしの場合は１人をランダム抽出
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    var kazu = Number(args[0]);
    if (kazu) {
        msg.channel.send(msg.member.voiceChannel.members.random(kazu));
    } else {
        msg.channel.send(msg.member.voiceChannel.members.random(1));
    }
}

function handlePoll(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = msg.content.replace(/\r?\n/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    var pollCmd = '/poll " ' + msg.author.username + 'たんのアンケート" ';
    for (let i = 0; i < args.length; i++) {
        pollCmd = pollCmd + '"' + args[i] + '" ';
    }
    msg.channel.send(pollCmd);
}

// **********************************
// ランダム系
// ルール、サブ、スペシャル、ブキ
// **********************************
function handleRule(msg) {
    console.log(rules);
    if (msg.content.startsWith('rule stage')) {
        var stage = common.stage2txt(Math.floor(Math.random() * 23).toString());
        msg.channel.send('`' + stage + '`でし！');
    } else if (msg.content.startsWith('rule')) {
        var rule = rules[Math.floor(Math.random() * 4)];
        msg.channel.send('`' + rule + '`でし！');
    }
}

function handleSub(msg) {
    var sub = subweapons[Math.floor(Math.random() * 12)];
    msg.channel.send('`' + sub + '`でし！');
}

function handleSpecial(msg) {
    var special = specialweapons[Math.floor(Math.random() * 10)];
    msg.channel.send('`' + special + '`でし！');
}

function handleBuki(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    args.shift();

    let amount = 1;
    let bukiType = '';
    let isQuiz = false;

    if (args[0] === 'help') {
        let txt =
            'ブキをランダムに抽選します\n\n' +
            'n個のブキをランダムに選びます\n```\nbuki n\n例: buki 3```\n' +
            'ブキを種類縛りでランダムに選びます\n```\nbuki 種類(' +
            Object.keys(bukiTypes).join(`・`) +
            ')\n例: buki シューター```\n' +
            'ブキのサブスペクイズを出題します\n```\nbuki quiz```';
        msg.channel.send(txt);
    } else {
        if (bukiTypes[args[0]]) {
            // e.g. buki シューター
            bukiType = bukiTypes[args[0]];
            amount = 0;
        } else {
            // e.g. buki 8
            amount = Number(args[0]);
            if (amount > 10) {
                amount = 10;
                msg.channel.send("1度に出せるのは10個まででし！");
            }
        }
        // ブキサブスペクイズ判定
        if (args[0] === 'quiz') {
            isQuiz = true;
        }
        request.get(weaponsUrl, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                const weapons = JSON.parse(body);
                let bukis = weapons.filter(function(value) {
                    if (bukiType !== '') {
                        // 特定のbukiTypeが指定されているとき
                        return bukiType === value.type.key;
                    } else {
                        return true;
                    }
                });
                let bukiNames = bukis.map(function(value) {
                    return {
                        embed: {
                            author: {
                                name: msg.author.username + "のブキ",
                                icon_url: msg.author.avatarURL
                            },
                            color: 0xf02d7d,
                            fields: [
                                { name: value.name.ja_JP, value: value.sub.name.ja_JP + " / " + value.special.name.ja_JP },
                                // { name: "Sub", value: value.sub.name.ja_JP, inline: true },
                                // { name: "Special", value: value.special.name.ja_JP, inline: true }
                            ]
                        }
                    }

                });
                console.log(amount);
                if (amount) {
                    // var buki = random(size, amount).join('\n');
                    var length = bukiNames.length;
                    for (let i = 0; i < amount; i++) {
                        msg.channel.send(bukiNames[Math.floor(Math.random() * length)]);
                    }
                } else if (isQuiz) {
                    // var buki = random(bukiNames, 1)[0];
                    // console.log(amount);
                    // msg.reply(buki.replace('(', '(||').replace(')', '||)'));
                } else {
                    var buki = random(bukiNames, 1)[0];
                    msg.channel.send(buki);
                }
            } else {
                msg.channel.send('なんかエラーでてるわ');
            }
        });
    }
}

function handleShow(msg, args) {
    request.get('https://splatoon2.ink/data/schedules.json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if (args == `now`) {
                sendStageInfo(msg, data, 0);
            } else if (args == 'next') {
                sendStageInfo(msg, data, 1);
            } else if (args == 'nawabari') {
                const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_a.image;
                const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_b.image;
                const date =
                    common.unixTime2mdwhm(data.regular[0].start_time) +
                    ' – ' +
                    common.unixTime2mdwhm(data.regular[0].end_time);
                const regular_stage =
                    common.stage2txt(data.regular[0].stage_a.id) +
                    '\n' +
                    common.stage2txt(data.regular[0].stage_b.id) +
                    '\n';

                msg.channel.send({
                    embed: {
                        author: {
                            name: 'レギュラーマッチ',
                            icon_url: 'https://splatoon2.ink/assets/img/battle-regular.01b5ef.png',
                        },
                        color: 1693465,
                        fields: [{
                            name: date,
                            value: regular_stage,
                        }, ],
                        thumbnail: {
                            url: 'https://splatoon2.ink/assets/img/battle-regular.01b5ef.png',
                        },
                    },
                });
            } else if (msg.content === "show run") {
                request.get("https://splatoon2.ink/data/coop-schedules.json", function(
                    error,
                    response,
                    body
                ) {
                    if (!error && response.statusCode == 200) {
                        const data = JSON.parse(body);
                        const stage =
                            "https://splatoon2.ink/assets/splatnet" + data.details[0].stage.image;
                        const date =
                            common.unixTime2mdwhm(data.details[0].start_time) +
                            " – " +
                            common.unixTime2mdwhm(data.details[0].end_time);
                        const coop_stage = common.coop_stage2txt(data.details[0].stage.image) + "\n";
                        const weapons =
                            (data.details[0].weapons[0] ?
                                common.weapon2txt(data.details[0].weapons[0].id) :
                                "？") +
                            "・" +
                            (data.details[0].weapons[1] ?
                                common.weapon2txt(data.details[0].weapons[1].id) :
                                "？") +
                            "・" +
                            (data.details[0].weapons[2] ?
                                common.weapon2txt(data.details[0].weapons[2].id) :
                                "？") +
                            "・" +
                            (data.details[0].weapons[3] ?
                                common.weapon2txt(data.details[0].weapons[3].id) :
                                "？");

                        msg.channel.send("", {
                            embed: {
                                author: {
                                    name: "SALMON RUN",
                                    icon_url: "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png"
                                },
                                title: date,
                                color: 16733696,
                                fields: [{
                                        name: "支給ブキ",
                                        value: weapons
                                    },
                                    {
                                        name: "ステージ",
                                        value: coop_stage
                                    }
                                ],
                                image: {
                                    url: stage
                                }
                            }
                        });
                    } else {
                        console.log('なんかエラーでてるわ');
                    }
                });
            }
        }
    })
}

function sendStageInfo(msg, data, scheduleNum) {
    const l_args = common.getLeague(data, scheduleNum).split(',');
    const g_args = common.getGachi(data, scheduleNum).split(',');
    const l_date = l_args[0];
    const l_rule = l_args[1];
    const l_stage = l_args[2];
    const g_date = g_args[0];
    const g_rule = g_args[1];
    const g_stage = g_args[2];
    var title;
    if (scheduleNum == 0) {
        title = '現在';
    } else {
        title = '次';
    }

    msg.channel.send({
        embed: {
            author: {
                name: title + 'のリーグマッチ',
                icon_url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png',
            },
            color: 0xf02d7d,
            fields: [{
                name: l_date + '　' + l_rule,
                value: l_stage,
            }, ],
            thumbnail: {
                url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png',
            },
        },
    });
    msg.channel.send({
        embed: {
            author: {
                name: title + 'のガチマッチ',
                icon_url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png',
            },
            color: 0xf02d7d,
            fields: [{
                name: g_date + '　' + g_rule,
                value: g_stage,
            }, ],
            thumbnail: {
                url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png',
            },
        },
    });
}

function handleBan(msg) {
    if (msg.member.hasPermission('BAN_MEMBERS')) {
        var strCmd = msg.content.replace(/　/g, ' ');
        const args = strCmd.split(' ');
        args.shift();
        let members = [];
        msg.guild.members.forEach(member => {
            if (args[0] == member.id) {
                members.push(member.user);
            }
        });
        if (members) {
            msg.guild.channels.find('name', 'banコマンド').send('そんなユーザーいないでし');
        } else {
            let reason =
                'イカ部の管理人です。以下の理由によりイカ部から退部とさせていただきました。```' +
                args[1] +
                '```' +
                '申し訳ありませんが、質問等は受け付けておりませんので、よろしくお願いいたします。';
            let user = members[0].user;
            user.createDM().then(DMChannel => {
                // We have now a channel ready.
                // Send the message.
                DMChannel.send(reason)
                    .then(() => {
                        // Message sent, time to kick.
                        msg.guild.ban(user.id, reason);
                    })
                    .then((user, reason) => {
                        msg.guild.channels
                            .find('name', 'banコマンド')
                            .send(user.username + 'さんを以下の理由によりBANしました。\n' + reason);
                    });
            });
        }
    }
}

function handleIDCheck(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    let members = [];
    msg.guild.members.forEach(member => {
        if (args[0] == member.id) {
            members.push(member.user.username);
        }
    });
    if (members) {
        members.push('このIDのユーザーは存在しません');
    }
    msg.channel.send(members);
}

function handleCreateChannel(msg) {
    if (msg.member.hasPermission('ADMINISTRATOR')) {
        var strCmd = msg.content.replace(/　/g, ' ');
        const args = strCmd.split(' ');
        args.shift();
        var chName = args[0];
        msg.guild.createChannel(chName, { type: 'text' }).then(ch => msg.guild.setChannelPosition(ch, 99, false)).catch(console.error);
        msg.guild.createChannel(chName, { type: 'voice' }).then(ch => msg.guild.setChannelPosition(ch, 90, false).then(ch => ch.setUserLimit(2))).catch(console.error);
    }
}

const weaponsUrl = 'https://stat.ink/api/v2/weapon';
const rulesUrl = 'https://stat.ink/api/v2/rule';
const bukiTypes = {
    シューター: 'shooter',
    ブラスター: 'blaster',
    シェルター: 'brella',
    フデ: 'brush',
    チャージャー: 'charger',
    マニューバー: 'maneuver',
    リールガン: 'reelgun',
    ローラー: 'roller',
    スロッシャー: 'slosher',
    スピナー: 'splatling',
};

const rules = {
    '0': 'ガチエリア',
    '1': 'ガチヤグラ',
    '2': 'ガチホコ',
    '3': 'ガチアサリ',
};

const subweapons = {
    '0': 'スプラッシュボム',
    '1': 'キューバンボム',
    '2': 'クイックボム',
    '3': 'スプリンクラー',
    '4': 'ジャンプビーコン',
    '5': 'スプラッシュシールド',
    '6': 'ポイントセンサー',
    '7': 'トラップ',
    '8': 'カーリングボム',
    '9': 'ロボットボム',
    '10': 'ポイズンミスト',
    '11': 'タンサンボム',
    '12': 'トーピード',
};

const specialweapons = {
    '0': 'ジェットパック',
    '1': 'スーパーチャクチ',
    '2': 'マルチミサイル',
    '3': 'ハイパープレッサー',
    '4': 'アメフラシ',
    '5': 'ボムピッチャー',
    '6': 'インクアーマー',
    '7': 'イカスフィア',
    '8': 'バブルランチャー',
    '9': 'ナイスダマ',
    '10': 'ウルトラハンコ',
};

const random = (array, num) => {
    var a = array;
    var t = [];
    var r = [];
    var l = a.length;
    var n = num < l ? num : l;
    while (n-- > 0) {
        var i = (Math.random() * l) | 0;
        r[n] = t[i] || a[i];
        --l;
        t[i] = t[l] || a[l];
    }
    return r;
};