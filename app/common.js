const { EmbedBuilder } = require('discord.js');
const { searchMemberById } = require('./manager/memberManager.js');
const log4js = require('log4js');

module.exports = {
    isInteger: isInteger,
    getOpen: getOpen,
    getChallenge: getChallenge,
    getXMatch: getXMatch,
    getLeague: getLeague,
    getRegular: getRegular,
    checkFes: checkFes,
    unixTime2hm: unixTime2hm,
    sp3unixTime2hm: sp3unixTime2hm,
    unixTime2mdwhm: unixTime2mdwhm,
    sp3unixTime2mdwhm: sp3unixTime2mdwhm,
    sp3unixTime2ymdw: sp3unixTime2ymdw,
    unixTime2ymdw: unixTime2ymdw,
    rule2txt: rule2txt,
    sp3rule2txt: sp3rule2txt,
    stage2txt: stage2txt,
    sp3stage2txt: sp3stage2txt,
    coop_stage2txt: coop_stage2txt,
    sp3coop_stage2txt: sp3coop_stage2txt,
    weapon2txt: weapon2txt,
    rgbToHex: rgbToHex,
    random: randomSelect,
    composeEmbed: composeEmbed,
    dateAdd: dateAdd,
    dateDiff: dateDiff,
    datetimeDiff: datetimeDiff,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty,
    getCloseEmbed: getCloseEmbed,
    getCommandHelpEmbed: getCommandHelpEmbed,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger();

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

function sp3unixTime2hm(datetime) {
    const date = new Date(datetime);
    const d = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC = UTC + 9
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
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

function sp3unixTime2mdwhm(datetime) {
    const date = new Date(datetime);
    const d = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC = UTC + 9
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

function sp3unixTime2ymdw(datetime) {
    const date = new Date(datetime);
    const d = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC = UTC + 9
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

function sp3rule2txt(name) {
    switch (name) {
        case 'Turf War':
            return 'ナワバリバトル';
        case 'Tower Control':
            return 'ガチヤグラ';
        case 'Splat Zones':
            return 'ガチエリア';
        case 'Rainmaker':
            return 'ガチホコバトル';
        case 'Clam Blitz':
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

function sp3stage2txt(key) {
    switch (key) {
        case 1:
            return 'ユノハナ大渓谷';
        case 2:
            return 'ゴンズイ地区';
        case 3:
            return 'ヤガラ市場';
        case 4:
            return 'マテガイ放水路';
        // case 5:
        //     return '';
        case 6:
            return 'ナメロウ金属';
        // case 7:
        //     return '';
        // case 8:
        //     return '';
        // case 9:
        //     return '';
        case 10:
            return 'マサバ海峡大橋';
        case 11:
            return 'キンメダイ美術館';
        case 12:
            return 'マヒマヒリゾート＆スパ';
        case 13:
            return '海女美術大学';
        case 14:
            return 'チョウザメ造船';
        case 15:
            return 'ザトウマーケット';
        case 16:
            return 'スメーシーワールド';
        // case 17:
        //     return '';
        // case 18:
        //     return '';
        // case 19:
        //     return '';
        // case 20:
        //     return '';
        // case 21:
        //     return '';
        // case 22:
        //     return '';
        // case 9999:
        //     return '';
        default:
            return 'そーりー・あんでふぁいんど';
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

function sp3coop_stage2txt(key) {
    switch (key) {
        // case 0:
        //     return '';
        case 1:
            return 'シェケナダム';
        case 2:
            return 'アラマキ砦';
        // case 3:
        //     return '';
        // case 4:
        //     return '';
        // case 5:
        //     return '';
        // case 6:
        //     return '';
        case 7:
            return 'ムニ・エール海洋発電所';
        // case 8:
        //     return '';
        default:
            return 'そーりー・あんでふぁいんど';
    }
}

function weapon2txt(key) {
    switch (key) {
        case '0':
            return 'ボールドマーカー';
        case '1':
            return 'ボールドマーカーネオ';
        case '10':
            return 'わかばシューター';
        case '20':
            return 'シャープマーカー';
        case '21':
            return 'シャープマーカーネオ';
        case '30':
            return 'プロモデラーMG';
        case '40':
            return 'スプラシューター';
        case '50':
            return '.52ガロン';
        case '51':
            return '.52ガロンデコ';
        case '60':
            return 'N-ZAP85';
        case '61':
            return 'N-ZAP89';
        case '70':
            return 'プライムシューター';
        case '80':
            return '.96ガロン';
        case '81':
            return '.96ガロンデコ';
        case '90':
            return 'ジェットスイーパー';
        case '200':
            return 'ノヴァブラスター';
        case '201':
            return 'ノヴァブラスターネオ';
        case '210':
            return 'ホットブラスター';
        case '220':
            return 'ロングブラスター';
        case '221':
            return 'ロングブラスターカスタム';
        case '230':
            return 'クラッシュブラスター';
        case '231':
            return 'クラッシュブラスターネオ';
        case '240':
            return 'ラピッドブラスター';
        case '241':
            return 'ラピッドブラスターデコ';
        case '250':
            return 'Rブラスターエリート';
        case '251':
            return 'Rブラスターエリートデコ';
        case '300':
            return 'L3リールガン';
        case '301':
            return 'L3リールガンD';
        case '310':
            return 'H3リールガン';
        case '311':
            return 'H3リールガンD';
        case '400':
            return 'ボトルガイザー';
        case '401':
            return 'ボトルガイザーフォイル';
        case '1000':
            return 'カーボンローラー';
        case '1001':
            return 'カーボンローラーデコ';
        case '1010':
            return 'スプラローラー';
        case '1020':
            return 'ダイナモローラー';
        case '1030':
            return 'ヴァリアブルローラー';
        case '1100':
            return 'パブロ';
        case '1110':
            return 'ホクサイ';
        case '1111':
            return 'ホクサイ・ヒュー';
        case '2000':
            return 'スクイックリンα';
        case '2001':
            return 'スクイックリンβ';
        case '2010':
            return 'スプラチャージャー';
        case '2020':
            return 'スプラスコープ';
        case '2030':
            return 'リッター4K';
        case '2040':
            return '4Kスコープ';
        case '2050':
            return '14式竹筒銃・甲';
        case '2051':
            return '14式竹筒銃・乙';
        case '2060':
            return 'ソイチューバー';
        case '2061':
            return 'ソイチューバーカスタム';
        case '3000':
            return 'バケットスロッシャー';
        case '3001':
            return 'バケットスロッシャーデコ';
        case '3010':
            return 'ヒッセン';
        case '3011':
            return 'ヒッセン・ヒュー';
        case '3020':
            return 'スクリュースロッシャー';
        case '3021':
            return 'スクリュースロッシャーネオ';
        case '3030':
            return 'オーバーフロッシャー';
        case '3040':
            return 'エクスプロッシャー';
        case '4000':
            return 'スプラスピナー';
        case '4001':
            return 'スプラスピナーコラボ';
        case '4010':
            return 'バレルスピナー';
        case '4020':
            return 'ハイドラント';
        case '4021':
            return 'ハイドラントカスタム';
        case '4030':
            return 'クーゲルシュライバー';
        case '4040':
            return 'ノーチラス47';
        case '5000':
            return 'スパッタリー';
        case '5001':
            return 'スパッタリー・ヒュー';
        case '5010':
            return 'スプラマニューバー';
        case '5020':
            return 'ケルビン525';
        case '5021':
            return 'ケルビン525デコ';
        case '5030':
            return 'デュアルスイーパー';
        case '5031':
            return 'デュアルスイーパーカスタム';
        case '5040':
            return 'クアッドホッパーブラック';
        case '5041':
            return 'クアッドホッパーホワイト';
        case '6000':
            return 'パラシェルター';
        case '6001':
            return 'パラシェルターソレーラ';
        case '6010':
            return 'キャンピングシェルター';
        case '6011':
            return 'キャンピングシェルターソレーラ';
        case '6020':
            return 'スパイガジェット';
        case '6021':
            return 'スパイガジェットソレーラ';
        case '-2':
            return '❓';
        default:
            return '？';
    }
}

function getLeague(data, x) {
    let stage;
    let date;
    let rule;
    date = sp3unixTime2ymdw(data[x].startTime) + ' ' + sp3unixTime2hm(data[x].startTime) + ' – ' + sp3unixTime2hm(data[x].endTime);
    if (data[x].leagueMatchSettingleagueMatchSetting == null) {
        rule = 'フェス期間中';
        stage = 'フェス期間中はお休みでし';
    } else {
        rule = sp3rule2txt(data[x].leagueMatchSetting.vsRule.name);
        stage =
            sp3stage2txt(data[x].leagueMatchSetting.vsStages[0].vsStageId) +
            '／' +
            sp3stage2txt(data[x].leagueMatchSetting.vsStages[1].vsStageId);
    }
    return date + ',' + rule + ',' + stage;
}

function getOpen(data, x) {
    let stage;
    let date;
    let rule;
    date = sp3unixTime2ymdw(data[x].startTime) + ' ' + sp3unixTime2hm(data[x].startTime) + ' – ' + sp3unixTime2hm(data[x].endTime);
    if (data[x].bankaraMatchSettings == null) {
        rule = 'フェス期間中';
        stage = 'フェス期間中はお休みでし';
    } else {
        rule = sp3rule2txt(data[x].bankaraMatchSettings[1].vsRule.name);
        stage =
            sp3stage2txt(data[x].bankaraMatchSettings[1].vsStages[0].vsStageId) +
            '／' +
            sp3stage2txt(data[x].bankaraMatchSettings[1].vsStages[1].vsStageId);
    }
    return date + ',' + rule + ',' + stage;
}

function getChallenge(data, x) {
    let stage;
    let date;
    let rule;
    date = sp3unixTime2ymdw(data[x].startTime) + ' ' + sp3unixTime2hm(data[x].startTime) + ' – ' + sp3unixTime2hm(data[x].endTime);
    if (data[x].bankaraMatchSettings == null) {
        rule = 'フェス期間中';
        stage = 'フェス期間中はお休みでし';
    } else {
        rule = sp3rule2txt(data[x].bankaraMatchSettings[0].vsRule.name);
        stage =
            sp3stage2txt(data[x].bankaraMatchSettings[0].vsStages[0].vsStageId) +
            '／' +
            sp3stage2txt(data[x].bankaraMatchSettings[0].vsStages[1].vsStageId);
    }
    return date + ',' + rule + ',' + stage;
}

function getXMatch(data, x) {
    let stage;
    let date;
    let rule;
    date = sp3unixTime2ymdw(data[x].startTime) + ' ' + sp3unixTime2hm(data[x].startTime) + ' – ' + sp3unixTime2hm(data[x].endTime);
    if (data[x].xMatchSetting == null) {
        rule = 'フェス期間中';
        stage = 'フェス期間中はお休みでし';
    } else {
        rule = sp3rule2txt(data[x].xMatchSetting.vsRule.name);
        stage =
            sp3stage2txt(data[x].xMatchSetting.vsStages[0].vsStageId) + '／' + sp3stage2txt(data[x].xMatchSetting.vsStages[1].vsStageId);
    }
    return date + ',' + rule + ',' + stage;
}

/**
 * レギュラーマッチステージ情報取得
 * フェス期間中はフェス情報を取得する
 */
function getRegular(data, x) {
    let stage1;
    let stage2;
    let date;
    let time;
    let rule;
    let matchName;
    let iconURL;
    let color;
    if (checkFes(data, x)) {
        const fest_list = data.data.festSchedules.nodes;
        const f_setting = fest_list[x].festMatchSetting;

        date = sp3unixTime2ymdw(fest_list[x].startTime);
        time = sp3unixTime2hm(fest_list[x].startTime) + ' – ' + sp3unixTime2hm(fest_list[x].endTime);
        rule = sp3rule2txt(f_setting.vsRule.name);
        stage1 = sp3stage2txt(f_setting.vsStages[0].vsStageId);
        stage2 = sp3stage2txt(f_setting.vsStages[1].vsStageId);
        matchName = 'フェスマッチ';
        iconURL = 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/fes_icon.png';
        color = '#ead147';
    } else {
        const regular_list = data.data.regularSchedules.nodes;
        const r_setting = regular_list[x].regularMatchSetting;

        date = sp3unixTime2ymdw(regular_list[x].startTime);
        time = sp3unixTime2hm(regular_list[x].startTime) + ' – ' + sp3unixTime2hm(regular_list[x].endTime);
        rule = sp3rule2txt(r_setting.vsRule.name);
        stage1 = sp3stage2txt(r_setting.vsStages[0].vsStageId);
        stage2 = sp3stage2txt(r_setting.vsStages[1].vsStageId);
        matchName = 'レギュラーマッチ';
        iconURL = 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png';
        color = '#B3FF00';
    }
    return {
        date: date,
        time: time,
        rule: rule,
        stage1: stage1,
        stage2: stage2,
        matchName: matchName,
        iconURL: iconURL,
        color: color,
    };
}

/**
 * フェス期間中かチェックする
 */
function checkFes(data, type) {
    const fest_list = data.data.festSchedules.nodes;
    const f_setting = fest_list[type].festMatchSetting;
    if (f_setting == null) {
        return false;
    } else {
        return true;
    }
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

function sendCloseMessage(msg, command) {
    try {
        msg.delete();
    } catch (error) {
        logger.error(error);
    }
}

function getCloseEmbed() {
    const embed = new EmbedBuilder();
    embed.setDescription(`↑の募集 〆`);
    return embed;
}

const recruit_command = {
    リグマ募集: '`/リグマ募集 now` or `/リグマ募集 next`',
    ナワバリ募集: '`/ナワバリ募集 now` or `/ナワバリ募集 next`',
    バンカラ募集: '`/バンカラ募集 now` or `/バンカラ募集 next`',
    フェス募集: '`/〇〇陣営 now` or `/〇〇陣営 next`',
    サーモン募集: `/サーモンラン募集 run`,
    別ゲー募集: '`/別ゲー募集 apex` or `/別ゲー募集 overwatch` or `/別ゲー募集 mhr` or `/別ゲー募集 valo` or `/別ゲー募集 other`',
};

function getCommandHelpEmbed(channelName) {
    let commandMessage;
    switch (channelName) {
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
        case 'フェス募集':
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
