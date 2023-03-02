module.exports = {
    composeEmbed: composeEmbed,
    rgbToHex: rgbToHex,
    isInteger: isInteger,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty,
    getMentionsFromMessage: getMentionsFromMessage,
    random: randomSelect,
    randomBool: randomBool,
    dateAdd: dateAdd,
    dateDiff: dateDiff,
    datetimeDiff: datetimeDiff,
    getCloseEmbed: getCloseEmbed,
    getCommandHelpEmbed: getCommandHelpEmbed,
    sleep: sleep,
};

const { EmbedBuilder } = require('discord.js');
const { searchMemberById } = require('./manager/memberManager.js');

async function composeEmbed(message, url) {
    const embed = new EmbedBuilder();
    if (isNotEmpty(message.content)) {
        embed.setDescription(message.content);
    }
    embed.setTimestamp(message.createdAt);
    const member = await searchMemberById(message.guild, message.author.id);
    if (isNotEmpty(url)) {
        embed.setTitle('引用元へジャンプ');
        embed.setURL(url);
    }
    embed.setAuthor({
        name: member.displayName,
        iconURL: member.displayAvatarURL(),
    });
    embed.setFooter({
        text: message.channel.name,
        iconURL: message.guild.iconURL(),
    });
    if (message.attachments.size > 0) {
        message.attachments.forEach((Attachment) => {
            embed.setImage(Attachment.proxyURL);
        });
    }
    return embed;
}

function rgbToHex(r, g, b) {
    [r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
}

function isInteger(x) {
    return Math.round(x) === x;
}

/**
 * IsEmpty
 * @param obj {any} - Target Object
 */
function isEmpty(obj) {
    if (obj === undefined || obj === null) {
        return true;
    } else if (Object.prototype.toString.call(obj).slice(8, -1) === 'String') {
        if (obj === '') {
            return true;
        }
    } else if (Object.prototype.toString.call(obj).slice(8, -1) === 'Array') {
        if (obj.length === 0) {
            return true;
        }
    } else if (Object.prototype.toString.call(obj).slice(8, -1) === 'Object') {
        if (!Object.keys(obj).length) {
            return true;
        }
    }
    return false;
}

/**
 * IsNotEmpty
 * @param obj {any} - Target Object
 */
function isNotEmpty(obj) {
    return !isEmpty(obj);
}

/**
 * メッセージから順番に取得したメンションを配列で返す
 * @param {*} message メッセージ
 * @param {boolean} id_only 取得したメンションをIDで返す場合はtrue
 * @returns メンション文字列を格納した配列を返す
 */
function getMentionsFromMessage(message, id_only = false) {
    const content = message.content;
    const matched = content.match(/<@\d{18,19}>/g);
    let results = [];
    if (id_only) {
        for (let mention of matched) {
            let delete_lead = mention.slice(2); // remove <@
            let delete_backward = delete_lead.slice(0, -1); // remove >
            results.push(delete_backward);
        }
        return results;
    }
    return matched;
}

function randomSelect(array, num) {
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
}

/**
 * 指定した確率でtrueを返し、それ以外はfalseを返す
 * @param {*} probability 確率(割合)
 * @returns boolean
 */
function randomBool(probability) {
    const num = Math.random();
    if (num < probability) {
        return true;
    } else {
        return false;
    }
}

/*
 *  日数または月数を加算
 *
 *  dt: 基準となる Date オブジェクト
 *  dd: 日数または月数
 *   u: 'D': dd は日数
 *      'M': dd は月数
 *
 */
function dateAdd(dt, dd, u) {
    var y = dt.getFullYear();
    var m = dt.getMonth();
    var d = dt.getDate();
    var r = new Date(y, m, d);
    if (typeof u === 'undefined' || u == 'D') {
        r.setDate(d + dd);
    } else if (u == 'M') {
        m += dd;
        y += parseInt(m / 12);
        m %= 12;
        var e = new Date(y, m + 1, 0).getDate();
        r.setFullYear(y, m, d > e ? e : d);
    }
    return r;
}

async function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

/*
 *  経過年・月・日数の計算
 *
 *  dt1: 開始年月日の Date オブジェクト
 *  dt2: 終了年月日の Date オブジェクト
 *    u:  'Y': 経過年数を求める
 *        'M': 経過月数を求める
 *        'D': 経過日数を求める
 *       'YM': 1年に満たない月数
 *       'MD': 1ヶ月に満たない日数
 *       'YD': 1年に満たない日数
 *    f: true: 初日算入
 *      false: 初日不算入
 *
 */
function dateDiff(dt1, dt2, u, f) {
    if (typeof dt2 == 'undefined') dt2 = new Date();
    if (f) dt1 = dateAdd(dt1, -1, 'D');
    var y1 = dt1.getFullYear();
    var m1 = dt1.getMonth();
    var y2 = dt2.getFullYear();
    var m2 = dt2.getMonth();
    var dt3,
        r = 0;
    if (typeof u === 'undefined' || u == 'D') {
        r = parseInt((dt2 - dt1) / (24 * 3600 * 1000));
    } else if (u == 'M') {
        r = y2 * 12 + m2 - (y1 * 12 + m1);
        dt3 = dateAdd(dt1, r, 'M');
        if (dateDiff(dt3, dt2, 'D') < 0) --r;
    } else if (u == 'Y') {
        r = parseInt(dateDiff(dt1, dt2, 'M') / 12);
    } else if (u == 'YM') {
        r = dateDiff(dt1, dt2, 'M') % 12;
    } else if (u == 'MD') {
        r = dateDiff(dt1, dt2, 'M');
        dt3 = dateAdd(dt1, r, 'M');
        r = dateDiff(dt3, dt2, 'D');
    } else if (u == 'YD') {
        r = dateDiff(dt1, dt2, 'Y');
        dt3 = dateAdd(dt1, r * 12, 'M');
        r = dateDiff(dt3, dt2, 'D');
    }
    return r;
}
/*
 *  経過時間（分）の計算
 */
function datetimeDiff(dt1, dt2) {
    diff = dt2.getTime() - dt1.getTime();
    const diffMinutes = Math.abs(diff) / (60 * 1000);
    return diffMinutes;
}

function getCloseEmbed() {
    const embed = new EmbedBuilder();
    embed.setDescription(`↑の募集 〆`);
    return embed;
}

const recruit_command = {
    プラベ募集: '`/プラベ募集 recruit` or `/プラベ募集 button`',
    リグマ募集: '`/リグマ募集 now` or `/リグマ募集 next`',
    ナワバリ募集: '`/ナワバリ募集 now` or `/ナワバリ募集 next`',
    バンカラ募集: '`/バンカラ募集 now` or `/バンカラ募集 next`',
    フェス募集: '`/〇〇陣営 now` or `/〇〇陣営 next`',
    サーモン募集: '`/サーモンラン募集 run`',
    別ゲー募集: '`/別ゲー募集 apex` or `/別ゲー募集 overwatch` or `/別ゲー募集 mhr` or `/別ゲー募集 valo` or `/別ゲー募集 other`',
};

function getCommandHelpEmbed(channelName) {
    let commandMessage;
    switch (channelName) {
        case 'プラベ募集':
            commandMessage = recruit_command.プラベ募集;
            break;
        case 'リグマ募集':
        case 'リグマ募集2':
        case '🔰リグマ募集':
            commandMessage = recruit_command.リグマ募集;
            break;
        case 'ナワバリ募集':
            commandMessage = recruit_command.ナワバリ募集;
            break;
        case 'バンカラ募集':
            commandMessage = recruit_command.バンカラ募集;
            break;
        case 'フウカ募集':
        case 'ウツホ募集':
        case 'マンタロー募集':
            commandMessage = recruit_command.フェス募集;
            break;
        case 'サーモン募集':
            commandMessage = recruit_command.サーモン募集;
            break;
        case '別ゲー募集':
            commandMessage = recruit_command.別ゲー募集;
            break;

        default:
            break;
    }

    const embed = new EmbedBuilder();
    embed.setDescription('募集コマンドは ' + `${commandMessage}` + `\n詳しくは <#${process.env.CHANNEL_ID_RECRUIT_HELP}> を確認するでし！`);
    return embed;
}
