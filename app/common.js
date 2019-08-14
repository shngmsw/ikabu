module.exports = {
  isInteger: isInteger,
  getGachi: getGachi,
  getLeague: getLeague,
  unixTime2hm: unixTime2hm,
  unixTime2mdwhm: unixTime2mdwhm,
  rule2txt: rule2txt,
  stage2txt: stage2txt,
  coop_stage2txt: coop_stage2txt,
  weapon2txt: weapon2txt,
  rgbToHex: rgbToHex
}

function rgbToHex (r, g, b){
  [r, g, b]
    .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
};
function unixTime2hm (intTime) {
    const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return hour + ':' + min;
};

function unixTime2mdwhm (intTime) {
    const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return month + '/' + day + '(' + week + ') ' + hour + ':' + min;
};

function rule2txt (key) {
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
};

function stage2txt (key) {
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
};

function coop_stage2txt (key) {
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
};

function weapon2txt (key) {
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
    }
};

function getLeague(data, x) {
    let stage;
    let date;
    let rule;
    let rstr;
    date =
        unixTime2mdwhm(data.league[x].start_time) +
        " – " +
        unixTime2hm(data.league[x].end_time);
    rule = rule2txt(data.league[x].rule.key);
    stage =
        stage2txt(data.league[x].stage_a.id) +
        "\n" +
        stage2txt(data.league[x].stage_b.id) +
        "\n";
    rstr = date + "," + rule + "," + stage;
    console.log(rstr);
    return rstr;
}

function getGachi(data, x) {
    let stage;
    let date;
    let rule;
    let rstr;
    date =
        unixTime2mdwhm(data.gachi[x].start_time) +
        " – " +
        unixTime2hm(data.gachi[x].end_time);
    rule = rule2txt(data.gachi[x].rule.key);
    stage =
        stage2txt(data.gachi[x].stage_a.id) +
        "\n" +
        stage2txt(data.gachi[x].stage_b.id) +
        "\n";
    rstr = date + "," + rule + "," + stage;
    console.log(rstr);
    return rstr;
}

function isInteger(x) {
    return Math.round(x) === x;
}