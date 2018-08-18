// Response for Uptime Robot
const http = require('http');
http.createServer(function (request, response) {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Discord bot is active now \n');
}).listen(3000);

// const express = require('express');
// const app = express();
// app.listen(8080);
// setInterval(() => { http.get(`https://ikabu.glitch.me/`) }, 299990);

// Discord bot implements
const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const unixTime2hm = (intTime) => {
  const d = new Date( intTime * 1000　+ 9 * 60 * 60 * 1000 );
  const month = d.getUTCMonth() + 1;
  const day  = d.getUTCDate();
  const hour = d.getUTCHours();
  const min  = ( '0' + d.getUTCMinutes() ).slice(-2);
  const dow = d.getUTCDay();
  const week = [ '日', '月', '火', '水', '木', '金', '土' ][dow];
  return ( hour + ':' + min );
};

const unixTime2mdwhm = (intTime) => {
  const d = new Date( intTime * 1000　+ 9 * 60 * 60 * 1000 );
  const month = d.getUTCMonth() + 1;
  const day  = d.getUTCDate();
  const hour = d.getUTCHours();
  const min  = ( '0' + d.getUTCMinutes() ).slice(-2);
  const dow = d.getUTCDay();
  const week = [ '日', '月', '火', '水', '木', '金', '土' ][dow];
  return ( month + '/' + day + '(' + week + ') '+ hour + ':' + min );
};

const rule2txt = (key) => {
  switch (key) {
    case 'tower_control': return 'ガチヤグラ';
    case 'splat_zones': return 'ガチエリア';
    case 'rainmaker': return 'ガチホコバトル';
    case 'clam_blitz': return 'ガチアサリ';
  }
};

const stage2txt = (key) => {
  switch (key) {
    case '0': return 'バッテラストリート';
    case '1': return 'フジツボスポーツクラブ';
    case '2': return 'ガンガゼ野外音楽堂';
    case '3': return 'チョウザメ造船';
    case '4': return '海女美術大学';
    case '5': return 'コンブトラック';
    case '6': return 'マンタマリア号';
    case '7': return 'ホッケふ頭';
    case '8': return 'タチウオパーキング';
    case '9': return 'エンガワ河川敷';
    case '10': return 'モズク農園';
    case '11': return 'Ｂバスパーク';
    case '12': return 'デボン海洋博物館';
    case '13': return 'ザトウマーケット';
    case '14': return 'ハコフグ倉庫';
    case '15': return 'アロワナモール';
    case '16': return 'モンガラキャンプ場';
    case '17': return 'ショッツル鉱山';
    case '18': return 'アジフライスタジアム';
    case '19': return 'ホテルニューオートロ';
    case '20': return 'スメーシーワールド';
    case '21': return 'アンチョビットゲームズ';
    case '9999': return 'ミステリーゾーン';
  }
};

const coop_stage2txt = (key) => {
    switch (key) {
    case '/images/coop_stage/e9f7c7b35e6d46778cd3cbc0d89bd7e1bc3be493.png': return 'トキシラズいぶし工房';
    case '/images/coop_stage/65c68c6f0641cc5654434b78a6f10b0ad32ccdee.png': return 'シェケナダム';
    case '/images/coop_stage/e07d73b7d9f0c64e552b34a2e6c29b8564c63388.png': return '難破船ドン・ブラコ';
    case '/images/coop_stage/6d68f5baa75f3a94e5e9bfb89b82e7377e3ecd2c.png': return '海上集落シャケト場';
  }
};
const weaponsUrl = 'https://stat.ink/api/v2/weapon';

const bukiTypes = {
  'シューター':'shooter',
  'ブラスター':'blaster',
  'シェルター':'brella',
  'フデ':'brush',
  'チャージャー':'charger',
  'マニューバー':'maneuver',
  'リールガン':'reelgun',
  'ローラー':'roller',
  'スロッシャー':'slosher',
  'スピナー':'splatling'
};

const weapon2txt = (key) => {
  switch (key) {
    case '0': return 'ボールドマーカー';
    case '1': return 'ボールドマーカーネオ';
    case '10': return 'わかばシューター';
    case '20': return 'シャープマーカー';
    case '21': return 'シャープマーカーネオ';
    case '30': return 'プロモデラーMG';
    case '40': return 'スプラシューター';
    case '50': return '.52ガロン';
    case '51': return '.52ガロンデコ';
    case '60': return 'N-ZAP85';
    case '61': return 'N-ZAP89';
    case '70': return 'プライムシューター';
    case '80': return '.96ガロン';
    case '81': return '.96ガロンデコ';
    case '90': return 'ジェットスイーパー';
    case '200': return 'ノヴァブラスター';
    case '201': return 'ノヴァブラスターネオ';
    case '210': return 'ホットブラスター';
    case '220': return 'ロングブラスター';
    case '221': return 'ロングブラスターカスタム';
    case '230': return 'クラッシュブラスター';
    case '231': return 'クラッシュブラスターネオ';
    case '240': return 'ラピッドブラスター';
    case '241': return 'ラピッドブラスターデコ';
    case '250': return 'Rブラスターエリート';
    case '251': return 'Rブラスターエリートデコ';
    case '300': return 'L3リールガン';
    case '301': return 'L3リールガンD';
    case '310': return 'H3リールガン';
    case '311': return 'H3リールガンD';
    case '400': return 'ボトルガイザー';
    case '401': return 'ボトルガイザーフォイル';
    case '1000': return 'カーボンローラー';
    case '1001': return 'カーボンローラーデコ';
    case '1010': return 'スプラローラー';
    case '1020': return 'ダイナモローラー';
    case '1030': return 'ヴァリアブルローラー';
    case '1100': return 'パブロ';
    case '1110': return 'ホクサイ';
    case '1111': return 'ホクサイ・ヒュー';
    case '2000': return 'スクイックリンα';
    case '2001': return 'スクイックリンβ';
    case '2010': return 'スプラチャージャー';
    case '2020': return 'スプラスコープ';
    case '2030': return 'リッター4K';
    case '2040': return '4Kスコープ';
    case '2050': return '14式竹筒銃・甲';
    case '2051': return '14式竹筒銃・乙';
    case '2060': return 'ソイチューバー';
    case '2061': return 'ソイチューバーカスタム';
    case '3000': return 'バケットスロッシャー';
    case '3001': return 'バケットスロッシャーデコ';
    case '3010': return 'ヒッセン';
    case '3011': return 'ヒッセン・ヒュー';
    case '3020': return 'スクリュースロッシャー';
    case '3021': return 'スクリュースロッシャーネオ';
    case '3030': return 'オーバーフロッシャー';
    case '3040': return 'エクスプロッシャー';
    case '4000': return 'スプラスピナー';
    case '4001': return 'スプラスピナーコラボ';
    case '4010': return 'バレルスピナー';
    case '4020': return 'ハイドラント';
    case '4021': return 'ハイドラントカスタム';
    case '4030': return 'クーゲルシュライバー';
    case '4040': return 'ノーチラス47';
    case '5000': return 'スパッタリー';
    case '5001': return 'スパッタリー・ヒュー';
    case '5010': return 'スプラマニューバー';
    case '5020': return 'ケルビン525';
    case '5021': return 'ケルビン525デコ';
    case '5030': return 'デュアルスイーパー';
    case '5031': return 'デュアルスイーパーカスタム';
    case '5040': return 'クアッドホッパーブラック';
    case '5041': return 'クアッドホッパーホワイト';
    case '6000': return 'パラシェルター';
    case '6001': return 'パラシェルターソレーラ';
    case '6010': return 'キャンピングシェルター';
    case '6011': return 'キャンピングシェルターソレーラ';
    case '6020': return 'スパイガジェット';
    case '6021': return 'スパイガジェットソレーラ';
  }
};

const rgbToHex = (r, g, b) => [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('');

const bukiList = [
  "わかばシューター",
  "スプラシューター",
  "スプラチャージャー",
  "スプラローラー",
  "スプラシューターコラボ",
  "スプラマニューバー",
  "もみじシューター",
  "パブロ",
  "ホットブラスター",
  "バケットスロッシャー",
  "プロモデラーMG",
  "カーボンローラー",
  "パブロ・ヒュー",
  "バレルスピナー",
  "バケットスロッシャーデコ",
  "N-ZAP85",
  "パラシェルター",
  "ボールドマーカー",
  "ホクサイ",
  "カーボンローラーデコ",
  "プライムシューター",
  "オーバーフロッシャー",
  "スプラマニューバーコラボ",
  "N-ZAP89",
  "スクイックリンα",
  "デュアルスイーパー",
  "スプラローラーコラボ",
  "バレルスピナーデコ",
  "スパイガジェット",
  "ラピッドブラスター",
  "スクリュースロッシャー",
  "ロングブラスター",
  ".52ガロン",
  "クアッドホッパーブラック",
  "スプラスコープ",
  "パラシェルターソレーラ",
  "ホクサイ・ヒュー",
  "ヒッセン",
  "ラピッドブラスターデコ",
  "スプラチャージャーコラボ",
  "ボトルガイザー",
  "デュアルスイーパーカスタム",
  "ケルビン525",
  "ヒッセン・ヒュー",
  "ジェットスイーパー",
  "スクイックリンβ",
  "ボールドマーカーネオ",
  "ロングブラスターカスタム",
  "14式竹筒銃・甲",
  "L3リールガン",
  "エクスプロッシャー",
  "スクリュースロッシャーネオ",
  "ノヴァブラスター",
  "スパイガジェットソレーラ",
  "ダイナモローラー",
  "プライムシューターコラボ",
  "リッター4K",
  "14式竹筒銃・乙",
  ".96ガロン",
  "クアッドホッパーホワイト",
  "Rブラスターエリート",
  ".52ガロンデコ",
  "ソイチューバー",
  "スプラスピナー",
  "キャンピングシェルター",
  "L3リールガンD",
  "ノヴァブラスターネオ",
  "ヴァリアブルローラー",
  "Rブラスターエリートデコ",
  "ケルビン525デコ",
  "ダイナモローラーテスラ",
  "シャープマーカー",
  "ボトルガイザーフォイル",
  "クーゲルシュライバー",
  "スプラスコープコラボ",
  "スプラスピナーコラボ",
  "リッター4Kカスタム",
  "ノーチラス47",
  ".96ガロンデコ",
  "スパッタリー",
  "シャープマーカーネオ",
  "ハイドラント",
  "ジェットスイーパーカスタム",
  "ホットブラスターカスタム",
  "ヴァリアブルローラーフォイル",
  "ソイチューバーカスタム",
  "プロモデラーRG",
  "キャンピングシェルターソレーラ",
  "H3リールガン",
  "ハイドラントカスタム",
  "スパッタリー・ヒュー",
  "クラッシュブラスター",
  "クラッシュブラスターネオ",
  "4Kスコープ",
  "4Kスコープカスタム",
  "H3リールガンD"
];

const blasterList = [
  "ホットブラスター",
  "ラピッドブラスター",
  "ロングブラスター",
  "ラピッドブラスターデコ",
  "ロングブラスターカスタム",
  "ノヴァブラスター",
  "Rブラスターエリート",
  "ノヴァブラスターネオ",
  "Rブラスターエリートデコ",
  "クラッシュブラスター",
  "クラッシュブラスターネオ",
];

const responseObject = {
  "aaa": "AAA?",
  "bbb": "BBB?",
  "ccc": "CCC?"
};

const sakana = [
  "起きてます",
  "寝てないです",
  "寝てます"
];

const fish_rap_lyrics = [
  "この世界は脆弱!静寂!情弱!孔雀!!",
  "テキストは誤字多数\n昼夜はもちろん逆転中\n深夜寝るやつは脆弱、情弱\nそんな俺は日々寝落ち中、求めてるぜお前からのチュー",
  "オレが時代の最先端！\nキメルゼ、オレのうにビーム",
];

// const icon = [
//   "👍",
//   "👎",
//   "💩"
// ];

const random = (array, num) => {
  var a = array;
  var t = [];
  var r = [];
  var l = a.length;
  var n = num < l ? num : l;
  while (n-- > 0) {
    var i = Math.random() * l | 0;
    r[n] = t[i] || a[i];
    --l;
    t[i] = t[l] || a[l];
  }
  return r;
}

client.on('message', async msg => {

  if(responseObject[msg.content]) {
    msg.channel.send(responseObject[msg.content]);
  };

  if (msg.content.includes('すてきやん') && msg.author.id==418680715882790912) {
    await msg.react('💩');
  };

  if (msg.content.startsWith('さかなたん起き')) {
    var message = sakana[Math.floor(Math.random() * sakana.length)];
    msg.reply(message);
  };

  if (msg.content=='fish rap') {
    var lyrics = fish_rap_lyrics[Math.floor(Math.random() * fish_rap_lyrics.length)];
    msg.channel.send('GYO!オレはうにくる!');
    msg.channel.send(lyrics);
  };

  if (msg.content.startsWith('pick')) {
    const args = msg.content.split(" ");
    args.shift();
    var picked = args[Math.floor(Math.random() * args.length)];
    var kazu = Number(args[0]);
    args.shift();
    if(kazu) {
      var picked = random(args, kazu).join('\n');
    } else {
      var picked = args[Math.floor(Math.random() * args.length)];
    }
    msg.channel.send(picked);
  };

  // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
  // 数字なしの場合は１人をランダム抽出
  if (msg.content.startsWith('vpick')) {
    const args = msg.content.split(" ");
    args.shift();
    var kazu = Number(args[0]);
    if(kazu) {
      msg.channel.send(msg.member.voiceChannel.members.random(kazu));
    } else {
      msg.channel.send(msg.member.voiceChannel.members.random(1));
    }
  };

  if (msg.content.startsWith('buki')) {
    const args = msg.content.split(" ");
    args.shift();

    let amount = 1;
    let bukiType = '';

    if (args[0] === 'help') {
      let txt = 'ブキをランダムに抽選します\n\n'
      + 'n個のブキをランダムに選びます\n```\nbuki n\n例: buki 3```\n'
      + 'ブキを種類縛りでランダムに選びます\n```\nbuki 種類(' + Object.keys(bukiTypes).join(`・`) + ')\n例: buki シューター```\n';
      msg.channel.send(txt);
    } else {
      if (bukiTypes[args[0]]) { // e.g. buki シューター
        bukiType = bukiTypes[args[0]];
        amount = 0;
      } else { // e.g. buki 8
        amount = Number(args[0])
      }
      request.get(weaponsUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const weapons = JSON.parse(body);
          let bukis = weapons.filter(function(value) {
            if (bukiType !== '') { // 特定のbukiTypeが指定されているとき
              return bukiType === value.type.key
            } else {
              return true;
            }
          })
          let bukiNames = bukis.map(function(value) {
            return value.name.ja_JP;
          })

          if (amount) {
            var buki = random(bukiNames, amount).join('\n');
              msg.channel.send(buki);
            } else {
              var buki = random(bukiNames, 1)[0];
              msg.reply(buki);
            }
        } else {
          msg.channel.send('なんかエラーでてるわ');
        }
      })
    }
  };

  if (msg.content.startsWith('blaster')) {
    const args = msg.content.split(" ");
    args.shift();
    var kazu = Number(args[0]);
    if(kazu) {
      var buki = random(blasterList, kazu).join('\n');
      msg.channel.send(buki);
    } else {
      var buki = blasterList[Math.floor(Math.random() * blasterList.length)];
      msg.reply(buki);
    }
  };
  // if (msg.content.startsWith('vote')) {
  //   const args = msg.content.split(" ");
  //   args.shift();
  //   let txt = args[0];
  //   args.shift();
  //   for (let i = 0; i < args.length; i++) {
  //     txt += '\n' + icon[i] + ' ' + args[i];
  //   }
  //   msg.channel.send(txt).then(function (msg) {
  //     for (let e = 0; e < args.length; e++) {
  //       msg.react(icon[e]);
  //     }
  //   })
  // };


  if (msg.content.startsWith('fes')) {
    const role_id_a = msg.guild.roles.find("name", "きのこの山派");
    const role_id_b = msg.guild.roles.find("name", "たけのこの里派");
    const args = msg.content.split(" ");
    args.shift();
  
    if ((msg.member.roles.has(role_id_a.id) && args[0] != 'b') || msg.content.startsWith('fes a')) {
      if(args[0]=="〆") {
        msg.guild.channels.find("name", "ナワバリ・フェス募集")
        .send(msg.author.username + 'たんの募集 〆');
      } else {
        request.get('https://splatoon2.ink/data/festivals.json', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            let txt = role_id_a.toString() + ' 【フェス募集：ヒメ派】\n' + msg.author.username + 'たんがフェスメン募集中！\n'
              + data.jp.festivals[0].names.alpha_short
              + '派のみなさん、いかがですか？';
            const date = ''
              + unixTime2mdwhm(data.jp.festivals[0].times.start) + ' – '
              + unixTime2mdwhm(data.jp.festivals[0].times.end);
            let desc = '[参加条件] ';
            args.shift();
            if (args.length > 0) {
              desc +=  args.join(" ");
            } else {
              desc +=  'なし';
            }
            const image = 'https://splatoon2.ink/assets/splatnet' + data.jp.festivals[0].images.alpha;
            const title = data.jp.festivals[0].names.alpha_long;
            const color = parseInt(rgbToHex(
              Math.round(data.jp.festivals[0].colors.alpha.r * 255),
              Math.round(data.jp.festivals[0].colors.alpha.g * 255),
              Math.round(data.jp.festivals[0].colors.alpha.b * 255)
            ), 16)
            msg.guild.channels.find("name", "ナワバリ・フェス募集")
            .send(txt, {
              embed: {
                "color": color,
                "author": {
                  "name": title,
                  "icon_url": 'https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S2_Splatfest_Logo.svg/45px-S2_Splatfest_Logo.svg.png'
                },
                "title": date,
                "description": desc,
                "thumbnail": {
                  "url": image
                }
              }
            });
          } else { msg.channel.send('なんかエラーでてるわ') }
        })
      }
    }

    if ((msg.member.roles.has(role_id_b.id) && args[0] != 'a') || msg.content.startsWith('fes b')) {
      if(args[0]=="〆") {
        msg.guild.channels.find("name", "ナワバリ・フェス募集")
        .send(msg.author.username + 'たんの募集 〆');
      } else {
        request.get('https://splatoon2.ink/data/festivals.json', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            let txt = role_id_b.toString() + ' 【フェス募集：イイダ派】\n' + msg.author.username + 'たんがフェスメン募集中！\n'
              + data.jp.festivals[0].names.bravo_short
              + '派のみなさん、いかがですか？';
            const date = ''
              + unixTime2mdwhm(data.jp.festivals[0].times.start) + ' – '
              + unixTime2mdwhm(data.jp.festivals[0].times.end);
            let desc = '[参加条件] ';
            args.shift();
            if (args.length > 0) {
              desc +=  args.join(" ");
            } else {
              desc +=  'なし';
            }
            const image = 'https://splatoon2.ink/assets/splatnet' + data.jp.festivals[0].images.bravo;
            const title = data.jp.festivals[0].names.bravo_long;
            const color = parseInt(rgbToHex(
              Math.round(data.jp.festivals[0].colors.bravo.r * 255),
              Math.round(data.jp.festivals[0].colors.bravo.g * 255),
              Math.round(data.jp.festivals[0].colors.bravo.b * 255)
            ), 16)
            msg.guild.channels.find("name", "ナワバリ・フェス募集")
            .send(txt, {
              embed: {
                "color": color,
                "author": {
                  "name": title,
                  "icon_url": 'https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S2_Splatfest_Logo.svg/45px-S2_Splatfest_Logo.svg.png'
                },
                "title": date,
                "description": desc,
                "thumbnail": {
                  "url": image
                }
              }
            });
          } else { msg.channel.send('なんかエラーでてるわ') }
        })
      }
    }
  };

if (msg.content.startsWith('next')) {
    const args = msg.content.split(" ");
    args.shift();
    if(args[0]=="〆") {
      msg.guild.channels.find("name", "リグマ募集")
      .send(msg.author.username + 'たんの募集 〆');
    } else {
      request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          let txt = '@everyone 【リグマ募集】\n' + msg.author.username + 'たんがリグメン募集中！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          txt += ''
            + unixTime2hm(data.league[1].start_time) + ' – '
            + unixTime2hm(data.league[1].end_time) + ' '
            + rule2txt(data.league[1].rule.key) + '\n'
            + stage2txt(data.league[1].stage_a.id) + '\n'
            + stage2txt(data.league[1].stage_b.id);
          const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[1].stage_a.image;
          const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[1].stage_b.image;
          msg.guild.channels.find("name", "リグマ募集")
          .send(txt, {
            files: [stage_a, stage_b]
          });
        } else { msg.channel.send('なんかエラーでてるわ') }
      })
    }
  };

if (msg.content.startsWith('now')||msg.content.startsWith('nou')) {
    const args = msg.content.split(" ");
    args.shift();
    if(args[0]=="〆") {
      msg.guild.channels.find("name", "リグマ募集")
      .send(msg.author.username + 'たんの募集 〆');
    } else {
      request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          let txt = '@everyone 【リグマ募集】\n' + msg.author.username + 'たんがリグメン募集中！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          txt += ''
            + unixTime2hm(data.league[0].start_time) + ' – '
            + unixTime2hm(data.league[0].end_time) + ' '
            + rule2txt(data.league[0].rule.key) + '\n'
            + stage2txt(data.league[0].stage_a.id) + '\n'
            + stage2txt(data.league[0].stage_b.id);
          const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[0].stage_a.image;
          const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[0].stage_b.image;
          msg.guild.channels.find("name", "リグマ募集")
          .send(txt, {
            files: [stage_a, stage_b]
          });
        } else { msg.channel.send('なんかエラーでてるわ') }
      })
    }
  };

	if (msg.content.startsWith('nawabari')) {
    const args = msg.content.split(" ");
    args.shift();
    if(args[0]=="〆") {
      msg.guild.channels.find("name", "ナワバリ・フェス募集")
      .send(msg.author.username + 'たんの募集 〆');
    } else {
      request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const stage = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_a.image;
          let txt = '@everyone 【ナワバリ募集】\n' + msg.author.username + 'たんがナワバリ中です！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          txt += 'よければ合流しませんか？';
          const date =  unixTime2mdwhm(data.regular[0].start_time) + ' – '
            + unixTime2mdwhm(data.regular[0].end_time);
          const regular_stage = stage2txt(data.regular[0].stage_a.id) + '\n'
            + stage2txt(data.regular[0].stage_b.id) + '\n';

          msg.guild.channels.find("name", "ナワバリ・フェス募集")
          .send(txt, {
            "embed": {
              "author": {
                "name": "レギュラーマッチ",
                "icon_url": "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
              },
              "color": 1693465,
              "fields": [
                {
                  "name": date,
                  "value": regular_stage
                }
              ],
              "thumbnail": {
                "url": "https://splatoon2.ink/assets/img/battle-regular.01b5ef.png"
              },
              "image": {
                "url": stage
              }
            }
          })
        } else { msg.channel.send('なんかエラーでてるわ') }
      })
    }
  };

  if (msg.content.startsWith('run')) {
    const args = msg.content.split(" ");
    args.shift();
    if(args[0]=="〆") {
      msg.guild.channels.find("name", "サーモン募集")
      .send(msg.author.username + 'たんの募集 〆');
    } else {
      request.get('https://splatoon2.ink/data/coop-schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          // let txt = '@everyone\n' + msg.author.username + 'さんがバイト中です！\nよければ合流しませんか？\n'
          //   + unixTime2mdwhm(data.details[0].start_time) + ' – '
          //   + unixTime2mdwhm(data.details[0].end_time) + ' '
          //   + coop_stage2txt(data.details[0].stage.image) + '\n'
          //   + weapon2txt(data.details[0].weapons[0].id) + '・'
          //   + weapon2txt(data.details[0].weapons[1].id) + '・'
          //   + weapon2txt(data.details[0].weapons[2].id) + '・'
          //   + weapon2txt(data.details[0].weapons[3].id);
          const stage = 'https://splatoon2.ink/assets/splatnet' + data.details[0].stage.image;
          let txt = '@everyone 【バイト募集】\n' + msg.author.username + 'たんがバイト中です！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          txt += 'よければ合流しませんか？';
          const date =  unixTime2mdwhm(data.details[0].start_time) + ' – '
            + unixTime2mdwhm(data.details[0].end_time);
          const coop_stage = coop_stage2txt(data.details[0].stage.image) + '\n';
          // const weapons = weapon2txt(data.details[0].weapons[0].id) + '・'
          //   + weapon2txt(data.details[0].weapons[1].id) + '・'
          //   + weapon2txt(data.details[0].weapons[2].id) + '・'
          //   + weapon2txt(data.details[0].weapons[3].id);
          const weapons = (data.details[0].weapons[0] ? weapon2txt(data.details[0].weapons[0].id) : '？') + '・'
          + (data.details[0].weapons[1] ? weapon2txt(data.details[0].weapons[1].id) : '？') + '・'
          + (data.details[0].weapons[2] ? weapon2txt(data.details[0].weapons[2].id) : '？') + '・'
          + (data.details[0].weapons[3] ? weapon2txt(data.details[0].weapons[3].id) : '？');

          // msg.channel.send(txt, {
          //   files: [stage]
          // });
          msg.guild.channels.find("name", "サーモン募集")
          .send(txt, {
            "embed": {
              "author": {
                "name": "SALMON RUN",
                "icon_url": "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png"
              },
              "title": date,
              "color": 16733696,
              "fields": [
                {
                  "name": weapons,
                  "value": coop_stage
                }
              ],
              "image": {
                "url": stage
              }
            }
          })
        } else { msg.channel.send('なんかエラーでてるわ') }
      });
    }
  };

	if (msg.content === 'help') {
    const txt = 'botのコメンド一覧を表示\n```help```\n'
    + '現在のリグマ情報を表示して募集\n```now 参加条件があれば記載```\n'
    + '次回のリグマ情報を表示して募集\n```next 参加条件があれば記載```\n'
    + '現在のナワバリ情報を表示して募集\n```nawabari 参加条件があれば記載```\n'
    + '現在のサーモンランを表示して募集\n```run 参加条件があれば記載```\n'
    + 'ブキをランダムで選出\n```buki 複数の場合は数字を記入```\n'
    + 'ヒメ派のフェスメンバーを募集\n```fes a 参加条件があれば記載```\n'
    + 'イイダ派のフェスメンバーを募集\n```fes b 参加条件があれば記載```\n'
    + '役職に応じて自動でフェスメンバーを募集\n※ヒメ派、イイダ派どちらかを投票して役職がついてる場合のみ\n```fes 参加条件があれば記載```\n'
    + '選択肢の中からランダム選出\n```pick 複数選出の場合は数字を記入 選択肢を半スペ空けで記入```\n'
    + '接続してるボイチャから数字分のヒトをランダム抽出\n```vpick 複数選出の場合は数字を記入```\n'
    + 'Fortniteのメンバーを募集\n```fn 参加条件があれば記載```\n'
    + 'マリオカートのメンバーを募集\n```mk 参加条件があれば記載```';
    msg.channel.send(txt);
  };

	if (msg.content.startsWith('fn')) {
    const args = msg.content.split(" ");
    args.shift();
    if(args[0]=="〆") {
      msg.guild.channels.find("name", "別ゲー募集")
      .send(msg.author.username + 'たんの募集 〆');
    } else {
      let txt = '@everyone 【Fortnite募集】\n' + msg.author.username + 'たんがFortniteメンバー募集中！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
      .send(txt, {
        files: ["https://cdn.glitch.com/6b791a64-15a8-4732-9fc4-9e01d48213be%2Ffortnite.jpg"]
      });
    }
  };

  if (msg.content.startsWith('mk')) {
    const args = msg.content.split(" ");
    args.shift();
    if(args[0]=="〆") {
      msg.guild.channels.find("name", "別ゲー募集")
      .send(msg.author.username + 'たんの募集 〆');
    } else {
      let txt = '@everyone 【マリオカート募集】\n' + msg.author.username + 'たんがマリオカート参加者募集中！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
      .send(txt, {
        files: ["https://cdn.glitch.com/6b791a64-15a8-4732-9fc4-9e01d48213be%2Fmk.png"]
      });
    }
  };

  // if (msg.content === 'test') {
  //   msg.channel.send({embed: {
  //     "color": 15740285,
  //     "author": {
  //       "name": "ガチホコバトル　AM1:00 – AM3:00",
  //       "icon_url": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/f/fe/Mode_Icon_Rainmaker.png/36px-Mode_Icon_Rainmaker.png"
  //     },
  //     "description": "ステージ中央の「ガチホコ」を持って相手陣地のゴールに運ぼう。ガチホコを持っている間は、専用の「ガチホコショット」が撃てるぞ。ガチホコを持っていられる時間には制限がある。時間が０になると、その場でガチホコが爆発してしまうぞ。大事なことはとにかく積極的に前進すること！ ガチホコを確保したら強気で攻めていこう。",
  //     "thumbnail": {
  //       "url": "https://cdn.wikimg.net/en/splatoonwiki/images/9/9b/Symbol_LeagueF.png"
  //     }
  //   }}).then(function (msg) {
  //     msg.channel.send({embed: {
  //       "title": "チョウザメ造船",
  //       "image": {
  //         "url": "https://cdn.discordapp.com/attachments/436232309247836181/436818058800267285/bc794e337900afd763f8a88359f83df5679ddf12.png"
  //       }
  //     }}).then(function (msg) {
  //       msg.channel.send({embed: {
  //         "title": "デボン海洋博物館",
  //         "image": {
  //           "url": "https://cdn.discordapp.com/attachments/436232309247836181/436818058158276609/23259c80272f45cea2d5c9e60bc0cedb6ce29e46.png"
  //         }
  //       }})
  //     })
  //   });
  // };

  // if (msg.content === 'hoko') {
  //   msg.channel.send({
  //     embed: {
  //       "color": 15740285,
  //       "author": {
  //         "name": "ガチホコバトル　AM1:00 – AM3:00",
  //         "icon_url": "https://cdn.glitch.com/2f605507-e50e-41c7-95dc-6a159c862c19%2Frainmaker.png"
  //       },
  //       "title": "チョウザメ造船\nデボン海洋博物館",
  //       "description": "ステージ中央の「ガチホコ」を持って相手陣地のゴールに運ぼう。ガチホコを持っている間は、専用の「ガチホコショット」が撃てるぞ。ガチホコを持っていられる時間には制限がある。時間が０になると、その場でガチホコが爆発してしまうぞ。大事なことはとにかく積極的に前進すること！ ガチホコを確保したら強気で攻めていこう。",
  //       "thumbnail": {
  //         "url": "https://cdn.wikimg.net/en/splatoonwiki/images/9/9b/Symbol_LeagueF.png"
  //       }
  //     }
  //   }).then(function (msg) {
  //     msg.channel.send({
  //       files: [
  //         "https://cdn.glitch.com/2f605507-e50e-41c7-95dc-6a159c862c19%2Fturf-wars-stage-7_2x.jpg",
  //         "https://cdn.glitch.com/2f605507-e50e-41c7-95dc-6a159c862c19%2Fturf-wars-stage-8_2x.jpg"
  //       ]
  //     })
  //   });
  // };

  // function send2Embeds(message) {
  //   let embed1 = new Discord.RichEmbed({
  //       title: "チョウザメ造船",
  //       image: {
  //         url: "https://cdn.glitch.com/2f605507-e50e-41c7-95dc-6a159c862c19%2Fturf-wars-stage-8_2x.jpg"
  //       }
  //   });
  //   let embed2 = new Discord.RichEmbed({
  //       title: "デボン海洋博物館",
  //       color: 15740285,
  //       image: {
  //         url: "https://cdn.glitch.com/2f605507-e50e-41c7-95dc-6a159c862c19%2Fturf-wars-stage-7_2x.jpg"
  //       }
  //   });
  //   message.channel.send(embed1)
  //   .then(msg => {
  //       message.channel.send(embed2);
  //   });
  // };

  // if (msg.content === 'stage') {
  //   send2Embeds(msg);
  // };

  // if (msg.content === 'judge') {
  //   await msg.react('👍');
  //   await msg.react('👎');
  // }

  // let reaction = await msg.react('💩');
  // // メッセージへリアクション
  // reaction.remove();
  // // リアクションを取り消し

  // console.log(msg.reactions.find(reaction => reaction.emoji.name === '👍').count);
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  guild.channels.find("name", "雑談部屋")
  .send(`${member.user.username}たん、よろしくお願いします！\nまずは ${guild.channels.find("name","イカ部心得")} と ${guild.channels.find("name","各部屋の説明")} をよく読んでから ${guild.channels.find("name","フレンドコード部屋")} で自己紹介も兼ねて自分のフレコを貼ってください\n\n${guild.name}のみんなが歓迎していますよ〜`)
  .then(sentMessage => sentMessage.react('👍'));
});

// client.on('messageReactionAdd', async (messageReaction, user) => {
//   messageReaction.channel.send('pong');
// });

// if (process.env.DISCORD_BOT_TOKEN == undefined) {
//   console.log('please set ENV: DISCORD_BOT_TOKEN');
//   process.exit(0);
// }

client.login(process.env.DISCORD_BOT_TOKEN);
