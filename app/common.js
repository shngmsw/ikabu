const Discord = require('discord.js');

module.exports = {
    isInteger: isInteger,
    getGachi: getGachi,
    getLeague: getLeague,
    unixTime2hm: unixTime2hm,
    unixTime2mdwhm: unixTime2mdwhm,
    unixTime2ymdw: unixTime2ymdw,
    rule2txt: rule2txt,
    stage2txt: stage2txt,
    coop_stage2txt: coop_stage2txt,
    weapon2txt: weapon2txt,
    rgbToHex: rgbToHex,
    random: randomSelect,
    composeEmbed: composeEmbed,
    dateAdd: dateAdd,
    dateDiff: dateDiff,
    datetimeDiff: datetimeDiff,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty,
};

function composeEmbed(message, url) {
    const embed = new Discord.MessageEmbed();
    embed.setDescription(message.content);
    embed.setTimestamp(message.createdAt);
    if (isNotEmpty(url)) {
        embed.setTitle('引用元へジャンプ');
        embed.setURL(url);
    }
    embed.setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
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

function unixTime2hm(intTime) {
    const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return hour + ':' + min;
}

function unixTime2mdwhm(intTime) {
    const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return month + '/' + day + '(' + week + ') ' + hour + ':' + min;
}

function unixTime2ymdw(intTime) {
    const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return year + '/' + month + '/' + day + ' (' + week + ')';
}

function rule2txt(key) {
    switch (key) {
        case 'tower_control':
            return 'ガチヤグラ';
        case 'splat_zones':
            return 'ガチエリア';
        case 'rainmaker':
            return 'ガチホコバトル';
        case 'clam_blitz':
            return 'ガチアサリ';
    }
}

function stage2txt(key) {
    switch (key) {
        case '0':
            return 'バッテラストリート';
        case '1':
            return 'フジツボスポーツクラブ';
        case '2':
            return 'ガンガゼ野外音楽堂';
        case '3':
            return 'チョウザメ造船';
        case '4':
            return '海女美術大学';
        case '5':
            return 'コンブトラック';
        case '6':
            return 'マンタマリア号';
        case '7':
            return 'ホッケふ頭';
        case '8':
            return 'タチウオパーキング';
        case '9':
            return 'エンガワ河川敷';
        case '10':
            return 'モズク農園';
        case '11':
            return 'Ｂバスパーク';
        case '12':
            return 'デボン海洋博物館';
        case '13':
            return 'ザトウマーケット';
        case '14':
            return 'ハコフグ倉庫';
        case '15':
            return 'アロワナモール';
        case '16':
            return 'モンガラキャンプ場';
        case '17':
            return 'ショッツル鉱山';
        case '18':
            return 'アジフライスタジアム';
        case '19':
            return 'ホテルニューオートロ';
        case '20':
            return 'スメーシーワールド';
        case '21':
            return 'アンチョビットゲームズ';
        case '22':
            return 'ムツゴ楼';
        case '9999':
            return 'ミステリーゾーン';
    }
}

function coop_stage2txt(key) {
    switch (key) {
        case '/images/coop_stage/e9f7c7b35e6d46778cd3cbc0d89bd7e1bc3be493.png':
            return 'トキシラズいぶし工房';
        case '/images/coop_stage/65c68c6f0641cc5654434b78a6f10b0ad32ccdee.png':
            return 'シェケナダム';
        case '/images/coop_stage/e07d73b7d9f0c64e552b34a2e6c29b8564c63388.png':
            return '難破船ドン・ブラコ';
        case '/images/coop_stage/6d68f5baa75f3a94e5e9bfb89b82e7377e3ecd2c.png':
            return '海上集落シャケト場';
        case '/images/coop_stage/50064ec6e97aac91e70df5fc2cfecf61ad8615fd.png':
            return '朽ちた箱舟 ポラリス';
    }
}

function weapon2txt(key) {
    switch (key) {
        case '0':
            return 'ボールドマーカー';
            break;
        case '1':
            return 'ボールドマーカーネオ';
            break;
        case '10':
            return 'わかばシューター';
            break;
        case '20':
            return 'シャープマーカー';
            break;
        case '21':
            return 'シャープマーカーネオ';
            break;
        case '30':
            return 'プロモデラーMG';
            break;
        case '40':
            return 'スプラシューター';
            break;
        case '50':
            return '.52ガロン';
            break;
        case '51':
            return '.52ガロンデコ';
            break;
        case '60':
            return 'N-ZAP85';
            break;
        case '61':
            return 'N-ZAP89';
            break;
        case '70':
            return 'プライムシューター';
            break;
        case '80':
            return '.96ガロン';
            break;
        case '81':
            return '.96ガロンデコ';
            break;
        case '90':
            return 'ジェットスイーパー';
            break;
        case '200':
            return 'ノヴァブラスター';
            break;
        case '201':
            return 'ノヴァブラスターネオ';
            break;
        case '210':
            return 'ホットブラスター';
            break;
        case '220':
            return 'ロングブラスター';
            break;
        case '221':
            return 'ロングブラスターカスタム';
            break;
        case '230':
            return 'クラッシュブラスター';
            break;
        case '231':
            return 'クラッシュブラスターネオ';
            break;
        case '240':
            return 'ラピッドブラスター';
            break;
        case '241':
            return 'ラピッドブラスターデコ';
            break;
        case '250':
            return 'Rブラスターエリート';
            break;
        case '251':
            return 'Rブラスターエリートデコ';
            break;
        case '300':
            return 'L3リールガン';
            break;
        case '301':
            return 'L3リールガンD';
            break;
        case '310':
            return 'H3リールガン';
            break;
        case '311':
            return 'H3リールガンD';
            break;
        case '400':
            return 'ボトルガイザー';
            break;
        case '401':
            return 'ボトルガイザーフォイル';
            break;
        case '1000':
            return 'カーボンローラー';
            break;
        case '1001':
            return 'カーボンローラーデコ';
            break;
        case '1010':
            return 'スプラローラー';
            break;
        case '1020':
            return 'ダイナモローラー';
            break;
        case '1030':
            return 'ヴァリアブルローラー';
            break;
        case '1100':
            return 'パブロ';
            break;
        case '1110':
            return 'ホクサイ';
            break;
        case '1111':
            return 'ホクサイ・ヒュー';
            break;
        case '2000':
            return 'スクイックリンα';
            break;
        case '2001':
            return 'スクイックリンβ';
            break;
        case '2010':
            return 'スプラチャージャー';
            break;
        case '2020':
            return 'スプラスコープ';
            break;
        case '2030':
            return 'リッター4K';
            break;
        case '2040':
            return '4Kスコープ';
            break;
        case '2050':
            return '14式竹筒銃・甲';
            break;
        case '2051':
            return '14式竹筒銃・乙';
            break;
        case '2060':
            return 'ソイチューバー';
            break;
        case '2061':
            return 'ソイチューバーカスタム';
            break;
        case '3000':
            return 'バケットスロッシャー';
            break;
        case '3001':
            return 'バケットスロッシャーデコ';
            break;
        case '3010':
            return 'ヒッセン';
            break;
        case '3011':
            return 'ヒッセン・ヒュー';
            break;
        case '3020':
            return 'スクリュースロッシャー';
            break;
        case '3021':
            return 'スクリュースロッシャーネオ';
            break;
        case '3030':
            return 'オーバーフロッシャー';
            break;
        case '3040':
            return 'エクスプロッシャー';
            break;
        case '4000':
            return 'スプラスピナー';
            break;
        case '4001':
            return 'スプラスピナーコラボ';
            break;
        case '4010':
            return 'バレルスピナー';
            break;
        case '4020':
            return 'ハイドラント';
            break;
        case '4021':
            return 'ハイドラントカスタム';
            break;
        case '4030':
            return 'クーゲルシュライバー';
            break;
        case '4040':
            return 'ノーチラス47';
            break;
        case '5000':
            return 'スパッタリー';
            break;
        case '5001':
            return 'スパッタリー・ヒュー';
            break;
        case '5010':
            return 'スプラマニューバー';
            break;
        case '5020':
            return 'ケルビン525';
            break;
        case '5021':
            return 'ケルビン525デコ';
            break;
        case '5030':
            return 'デュアルスイーパー';
            break;
        case '5031':
            return 'デュアルスイーパーカスタム';
            break;
        case '5040':
            return 'クアッドホッパーブラック';
            break;
        case '5041':
            return 'クアッドホッパーホワイト';
            break;
        case '6000':
            return 'パラシェルター';
            break;
        case '6001':
            return 'パラシェルターソレーラ';
            break;
        case '6010':
            return 'キャンピングシェルター';
            break;
        case '6011':
            return 'キャンピングシェルターソレーラ';
            break;
        case '6020':
            return 'スパイガジェット';
            break;
        case '6021':
            return 'スパイガジェットソレーラ';
            break;
        case '-2':
            return '❓';
            break;
        default:
            return '？';
            break;
    }
}

function getLeague(data, x) {
    let stage;
    let date;
    let rule;
    let rstr;
    date = unixTime2mdwhm(data.league[x].start_time) + ' – ' + unixTime2hm(data.league[x].end_time);
    rule = rule2txt(data.league[x].rule.key);
    stage = stage2txt(data.league[x].stage_a.id) + '\n' + stage2txt(data.league[x].stage_b.id) + '\n';
    rstr = date + ',' + rule + ',' + stage;
    return rstr;
}

function getGachi(data, x) {
    let stage;
    let date;
    let rule;
    let rstr;
    date = unixTime2mdwhm(data.gachi[x].start_time) + ' – ' + unixTime2hm(data.gachi[x].end_time);
    rule = rule2txt(data.gachi[x].rule.key);
    stage = stage2txt(data.gachi[x].stage_a.id) + '\n' + stage2txt(data.gachi[x].stage_b.id) + '\n';
    rstr = date + ',' + rule + ',' + stage;
    return rstr;
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
