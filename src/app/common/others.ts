// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
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

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require('./manager/member_manager.js');

// @ts-expect-error TS(2393): Duplicate function implementation.
async function composeEmbed(message: $TSFixMe, url: $TSFixMe) {
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
    if (isNotEmpty(member)) {
        embed.setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL(),
        });
    } else {
        embed.setAuthor({
            name: '不明なユーザー',
            iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png',
        });
    }
    embed.setFooter({
        text: message.channel.name,
        iconURL: message.guild.iconURL(),
    });
    if (message.attachments.size > 0) {
        message.attachments.forEach((Attachment: $TSFixMe) => {
            embed.setImage(Attachment.proxyURL);
        });
    }
    return embed;
}

function rgbToHex(r: $TSFixMe, g: $TSFixMe, b: $TSFixMe) {
    [r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
}

function isInteger(x: $TSFixMe) {
    return Math.round(x) === x;
}

/**
 * IsEmpty
 * @param obj {any} - Target Object
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
function isEmpty(obj: $TSFixMe) {
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
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
function isNotEmpty(obj: $TSFixMe) {
    return !isEmpty(obj);
}

/**
 * メッセージから順番に取得したメンションを配列で返す
 * @param {*} message メッセージ
 * @param {boolean} id_only 取得したメンションをIDで返す場合はtrue
 * @returns メンション文字列を格納した配列を返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getMention... Remove this comment to see the full error message
function getMentionsFromMessage(message: $TSFixMe, id_only = false) {
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

function randomSelect(array: $TSFixMe, num: $TSFixMe) {
    var a = array;
    var t: $TSFixMe = [];
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
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'randomBool... Remove this comment to see the full error message
function randomBool(probability: $TSFixMe) {
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
function dateAdd(dt: $TSFixMe, dd: $TSFixMe, u: $TSFixMe) {
    var y = dt.getFullYear();
    var m = dt.getMonth();
    var d = dt.getDate();
    var r = new Date(y, m, d);
    if (typeof u === 'undefined' || u == 'D') {
        r.setDate(d + dd);
    } else if (u == 'M') {
        m += dd;
        // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
        y += parseInt(m / 12);
        m %= 12;
        var e = new Date(y, m + 1, 0).getDate();
        r.setFullYear(y, m, d > e ? e : d);
    }
    return r;
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sleep'.
async function sleep(sec: $TSFixMe) {
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
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dateDiff'.
function dateDiff(dt1: $TSFixMe, dt2: $TSFixMe, u: $TSFixMe, f: $TSFixMe) {
    if (typeof dt2 == 'undefined') dt2 = new Date();
    if (f) dt1 = dateAdd(dt1, -1, 'D');
    var y1 = dt1.getFullYear();
    var m1 = dt1.getMonth();
    var y2 = dt2.getFullYear();
    var m2 = dt2.getMonth();
    var dt3,
        r = 0;
    if (typeof u === 'undefined' || u == 'D') {
        // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
        r = parseInt((dt2 - dt1) / (24 * 3600 * 1000));
    } else if (u == 'M') {
        r = y2 * 12 + m2 - (y1 * 12 + m1);
        dt3 = dateAdd(dt1, r, 'M');
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        if (dateDiff(dt3, dt2, 'D') < 0) --r;
    } else if (u == 'Y') {
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        r = parseInt(dateDiff(dt1, dt2, 'M') / 12);
    } else if (u == 'YM') {
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        r = dateDiff(dt1, dt2, 'M') % 12;
    } else if (u == 'MD') {
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        r = dateDiff(dt1, dt2, 'M');
        dt3 = dateAdd(dt1, r, 'M');
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        r = dateDiff(dt3, dt2, 'D');
    } else if (u == 'YD') {
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        r = dateDiff(dt1, dt2, 'Y');
        dt3 = dateAdd(dt1, r * 12, 'M');
        // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
        r = dateDiff(dt3, dt2, 'D');
    }
    return r;
}
/*
 *  経過時間（分）の計算
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'datetimeDi... Remove this comment to see the full error message
function datetimeDiff(dt1: $TSFixMe, dt2: $TSFixMe) {
    // @ts-expect-error TS(2304): Cannot find name 'diff'.
    diff = dt2.getTime() - dt1.getTime();
    // @ts-expect-error TS(2304): Cannot find name 'diff'.
    const diffMinutes = Math.abs(diff) / (60 * 1000);
    return diffMinutes;
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getCloseEm... Remove this comment to see the full error message
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

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getCommand... Remove this comment to see the full error message
function getCommandHelpEmbed(channelName: $TSFixMe) {
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
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    embed.setDescription('募集コマンドは ' + `${commandMessage}` + `\n詳しくは <#${process.env.CHANNEL_ID_RECRUIT_HELP}> を確認するでし！`);
    return embed;
}
