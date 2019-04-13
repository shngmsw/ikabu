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
const Combinatorics = require('js-combinatorics');

// play youtube
const streamOptions = { seek: 0, volume: 1 };
const broadcast = client.createVoiceBroadcast();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const unixTime2hm = (intTime) => {
  const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const min = ('0' + d.getUTCMinutes()).slice(-2);
  const dow = d.getUTCDay();
  const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
  return (hour + ':' + min);
};

const unixTime2mdwhm = (intTime) => {
  const d = new Date(intTime * 1000 + 9 * 60 * 60 * 1000);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const min = ('0' + d.getUTCMinutes()).slice(-2);
  const dow = d.getUTCDay();
  const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
  return (month + '/' + day + '(' + week + ') ' + hour + ':' + min);
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
    case '22': return 'ムツゴ楼';
    case '9999': return 'ミステリーゾーン';
  }
};

const coop_stage2txt = (key) => {
  switch (key) {
    case '/images/coop_stage/e9f7c7b35e6d46778cd3cbc0d89bd7e1bc3be493.png': return 'トキシラズいぶし工房';
    case '/images/coop_stage/65c68c6f0641cc5654434b78a6f10b0ad32ccdee.png': return 'シェケナダム';
    case '/images/coop_stage/e07d73b7d9f0c64e552b34a2e6c29b8564c63388.png': return '難破船ドン・ブラコ';
    case '/images/coop_stage/6d68f5baa75f3a94e5e9bfb89b82e7377e3ecd2c.png': return '海上集落シャケト場';
    case '/images/coop_stage/50064ec6e97aac91e70df5fc2cfecf61ad8615fd.png': return '朽ちた箱舟 ポラリス';
  }
};
const weaponsUrl = 'https://stat.ink/api/v2/weapon';
const rulesUrl = 'https://stat.ink/api/v2/rule';

const hotdogUrl = 'https://youtu.be/9mD-ZmWuFTQ?t=60';

const bukiTypes = {
  'シューター': 'shooter',
  'ブラスター': 'blaster',
  'シェルター': 'brella',
  'フデ': 'brush',
  'チャージャー': 'charger',
  'マニューバー': 'maneuver',
  'リールガン': 'reelgun',
  'ローラー': 'roller',
  'スロッシャー': 'slosher',
  'スピナー': 'splatling'
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

const responseObject = {
  "aaa": "AAA?",
  "bbb": "BBB?",
  "ccc": "CCC?"
};

const rules = {
  "0": "ガチエリア",
  "1": "ガチヤグラ",
  "2": "ガチホコ",
  "3": "ガチアサリ",
  "5": "ガチエリア",
  "4": "ガチヤグラ",
  "6": "ガチホコ",
  "7": "ガチエリア",
  "8": "ガチヤグラ",
  "9": "ガチホコ"
};

const subweapons = {
  "0": "スプラッシュボム",
  "1": "キューバンボム",
  "2": "クイックボム",
  "3": "スプリンクラー",
  "4": "ジャンプビーコン",
  "5": "スプラッシュシールド",
  "6": "ポイントセンサー",
  "7": "トラップ",
  "8": "カーリングボム",
  "9": "ロボットボム",
  "10": "ポイズンミスト",
  "11": "タンサンボム",
  "12": "トーピード"
};

const specialweapons = {
  "0": "ジェットパック",
  "1": "スーパーチャクチ",
  "2": "マルチミサイル",
  "3": "ハイパープレッサー",
  "4": "アメフラシ",
  "5": "ボムピッチャー",
  "6": "インクアーマー",
  "7": "イカスフィア",
  "8": "バブルランチャー",
  "9": "ナイスダマ",
  "10": "ウルトラハンコ",
};

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

  if (responseObject[msg.content]) {
    msg.channel.send(responseObject[msg.content]);
  };
  
  if (msg.content.startsWith('ping ')) {
    var strCmd = msg.content.replace("ping ", "");
    msg.channel.send(strCmd);
  };
  
  
  
  
  if (msg.content.includes('すてきやん') && msg.author.id == 418680715882790912) {
    await msg.react('💩');
  };
  
  if (msg.content.startsWith('kansen ')) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    
    var how_many_times = Number(args[0]);
    var resultList = new Array();
    var cmb = Combinatorics.combination(['1','2','3','4','5','6','7','8', '9', '10'], 2);
    var tmp_watching_list = cmb.toArray();
    var result = '';
    
    for (let i = 0; i < how_many_times; i++) {
      // next watchersが一人になったらリストを再生成
      if (tmp_watching_list.length <= 1 ) {
        var baseNum = 0;
        var choose_comb = tmp_watching_list[baseNum];
        resultList.push('`' + (i + 1) + '回目：'+ choose_comb + '`');
        var tmp_watching_list = cmb.toArray();
      } else {
        var baseNum = Math.floor(Math.random() * tmp_watching_list.length);
        var choose_comb = tmp_watching_list[baseNum];
       
        resultList.push('`' + (i + 1) + '回目：'+ choose_comb + '`');
        
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

          
  if (msg.content.startsWith('timer ')) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    var kazu = Number(args[0]);
    var count = kazu;
    if (count <= 10 && count > 0 && isInteger(kazu)) {
      msg.reply('タイマーを' + count + '分後にセットしたでし！')
      var countdown = function () {
        count--;
        if (count != 0) {
          msg.reply('残り' + count + '分でし')
        } else {
          msg.reply('時間でし！');
        }
      }
      var id = setInterval(function () {
        countdown();
        if (count <= 0) {
          clearInterval(id);
        }
      }, 60000);
    } else {
      msg.reply('10分以内しか入力できないでし！正の整数以外もダメでし！')
    }
  }

  if (msg.content.startsWith('timer')) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    var str = args[0];
    if (str === 'cancel') {
      msg.reply('キャンセルします');
      clearInterval(id);
    }
  }
  // **********************************
  // pick
  // **********************************
  if (msg.content.startsWith('pick')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = msg.content.replace(/\r?\n/g, " ");
    const args = strCmd.split(" ");
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
  };

  // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
  // 数字なしの場合は１人をランダム抽出
  if (msg.content.startsWith('vpick')) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    var kazu = Number(args[0]);
    if (kazu) {
      msg.channel.send(msg.member.voiceChannel.members.random(kazu));
    } else {
      msg.channel.send(msg.member.voiceChannel.members.random(1));
    }
  };

  if (msg.content.startsWith('poll')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = msg.content.replace(/\r?\n/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    var pollCmd = '/poll " ' + msg.author.username + 'たんのアンケート" ';
    for (let i = 0; i < args.length; i++) {
      pollCmd = pollCmd + '"' + args[i] + '" ';
    }
    msg.channel.send(pollCmd);
  };
  
  if (msg.content.startsWith('/poll')) {
	  if (msg.author.username === 'ブキチ') {
      console.log(msg.author.username);
      msg.delete();
    }
  };

  // **********************************
  // ランダム系
  // ルール、サブ、スペシャル、ブキ
  // **********************************
  if (msg.content.startsWith('rule')) {
    var rule = rules[Math.floor(Math.random() * 10)];
    msg.channel.send('`' + rule + '`でし！');
  }

  if (msg.content.startsWith('rule stage')) {
    var stage = stage2txt(Math.floor(Math.random() * 23).toString());
    msg.channel.send('`' + stage + '`でし！');
  }
  
  if (msg.content.startsWith('sub')) {
    var sub = subweapons[Math.floor(Math.random() * 12)];
    msg.channel.send('`' + sub + '`でし！');
  }

  if (msg.content.startsWith('special')) {
    var special = specialweapons[Math.floor(Math.random() * 10)];
    msg.channel.send('`' + special + '`でし！');
  }

  if (msg.content.startsWith('re')) {
    //var strCmd = msg.content.replace(/　/g, " ");
    const args = msg.content.split('|');
    args.shift();

    msg.channel.send(args[0]);
  };

  if (msg.content.startsWith('buki')) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();

    let amount = 1;
    let bukiType = '';
    let isQuiz = false;

    if (args[0] === 'help') {
      let txt = 'ブキをランダムに抽選します\n\n'
        + 'n個のブキをランダムに選びます\n```\nbuki n\n例: buki 3```\n'
        + 'ブキを種類縛りでランダムに選びます\n```\nbuki 種類(' + Object.keys(bukiTypes).join(`・`) + ')\n例: buki シューター```\n'
        + 'ブキのサブスペクイズを出題します\n```\nbuki quiz```';
      msg.channel.send(txt);
    } else {
      if (bukiTypes[args[0]]) { // e.g. buki シューター
        bukiType = bukiTypes[args[0]];
        amount = 0;
      } else { // e.g. buki 8
        amount = Number(args[0])
      }
      // ブキサブスペクイズ判定
      if (args[0] === 'quiz') {
        isQuiz = true;
      }
      request.get(weaponsUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const weapons = JSON.parse(body);
          let bukis = weapons.filter(function (value) {
            if (bukiType !== '') { // 特定のbukiTypeが指定されているとき
              return bukiType === value.type.key
            } else {
              return true;
            }
          })
          let bukiNames = bukis.map(function (value) {
            return value.name.ja_JP + " (" + value.sub.name.ja_JP + " / " + value.special.name.ja_JP + ")";
          })
            console.log(amount);

          if (amount) {
            var buki = random(bukiNames, amount).join('\n');
            msg.channel.send('```' + buki + '```');
          } else if(isQuiz) {
            var buki = random(bukiNames, 1)[0];
            console.log(amount);
            msg.reply(buki.replace("(", "(||").replace(")", "||)"));
          } else {
            var buki = random(bukiNames, 1)[0];
            msg.reply('`' + buki + '`');
          }
        } else {
          msg.channel.send('なんかエラーでてるわ');
        }
      })
    }
  };




  // **********************************
  // 募集コマンド
  // **********************************
  if (msg.content.startsWith('fes')) {
    request.get('https://splatoon2.ink/data/festivals.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const role_id_a = msg.guild.roles.find("name", 'ヒメ派');
        const role_id_b = msg.guild.roles.find("name", 'イイダ派');
        var teamId = "";
        var strCmd = msg.content.replace(/　/g, " ");
        strCmd = strCmd.replace("  ", " ");
        const args = strCmd.split(" ");
        args.shift();
        
        if (strCmd.startsWith('fes a') || (msg.member.roles.has(role_id_a.id) && args[0] != 'b')) {
          teamId = "a"
        } else if(strCmd.startsWith('fes b') || (msg.member.roles.has(role_id_b.id) && args[0] != 'a')) {
          teamId = "b"
        } else {
          msg.reply(`${msg.guild.channels.find("name", "フェス投票所！")}`+"で投票してから募集するでし！\nもしくは`fes a`でヒメ派、`fes b`でイイダ派の募集ができるでし！")
        }
        if (teamId==="a") {
          if (strCmd.match("〆")) {
            msg.react('👌');
            msg.guild.channels.find("name", "ナワバリ・フェス募集")
              .send('```' + msg.author.username + 'たんの募集 〆```');
          } else {
            let txt = role_id_a.toString() + ' 【フェス募集：ヒメ派】\n' + msg.author.username + 'たんがフェスメン募集中でし！\n'
              + data.jp.festivals[0].names.alpha_short
              + '派のみなさん、いかがですか？';
            const date = ''
              + unixTime2mdwhm(data.jp.festivals[0].times.start) + ' – '
              + unixTime2mdwhm(data.jp.festivals[0].times.end);
            let desc = '[参加条件] ';

            if (strCmd.startsWith('fes a')) {
              args.shift();
            }

            if (args.length > 0) {
              desc += args.join(" ");
            } else {
              desc += 'なし';
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
                  "title": desc,
                  "description": date,
                  "thumbnail": {
                    "url": image
                  }
                }
              });
          }
        }

        if (teamId==="b") {
          if (strCmd.match("〆")) {
            msg.react('👌');
            msg.guild.channels.find("name", "ナワバリ・フェス募集")
              .send('```' + msg.author.username + 'たんの募集 〆```');
          } else {
            let txt = role_id_b.toString() + ' 【フェス募集：イイダ派】\n' + msg.author.username + 'たんがフェスメン募集中でし！\n'
              + data.jp.festivals[0].names.bravo_short
              + '派のみなさん、いかがですか？';
            const date = ''
              + unixTime2mdwhm(data.jp.festivals[0].times.start) + ' – '
              + unixTime2mdwhm(data.jp.festivals[0].times.end);

            let desc = '[参加条件] ';

            if (strCmd.startsWith('fes b')) {
              args.shift();
            }
            if (args.length > 0) {
              desc += args.join(" ");
            } else {
              desc += 'なし';
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
                  "title": desc,
                  "description": date,
                  "thumbnail": {
                    "url": image
                  }
                }
              });
          }
        }
      } else { msg.channel.send('なんかエラーでてるわ') }
    })
  };

  if (msg.content.startsWith('next')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react('👌');
      msg.guild.channels.find("name", "リグマ募集")
        .send('``` ' + msg.author.username + 'たんの募集 〆```');
    } else {
      request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const l_args = getLeague(data,1).split(",");
          let txt = '@everyone 【リグマ募集】\n' + msg.author.username + 'たんがリグメン募集中でし！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[1].stage_a.image;
          const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[1].stage_b.image;
          sendLeagueMatch(msg,txt,l_args);          
          msg.guild.channels.find("name", "リグマ募集")
            .send({files: [stage_a, stage_b]});
        } else { msg.channel.send('なんかエラーでてるわ') }
      })
    }
  };

  if (msg.content.startsWith('now') || msg.content.startsWith('nou')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react('👌');
      msg.guild.channels.find("name", "リグマ募集")
        .send('``` ' + msg.author.username + 'たんの募集 〆```');
    } else {
      request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const l_args = getLeague(data,0).split(",");
          let txt = '@everyone 【リグマ募集】\n' + msg.author.username + 'たんがリグメン募集中でし！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[0].stage_a.image;
          const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[0].stage_b.image;          
          sendLeagueMatch(msg,txt,l_args);
          msg.guild.channels.find("name", "リグマ募集")
            .send({files: [stage_a, stage_b]});
        } else { msg.channel.send('なんかエラーでてるわ') }
      })
    }
  };

  if (msg.content.startsWith('nawabari')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react('👌');
      msg.guild.channels.find("name", "ナワバリ・フェス募集")
        .send('```' + msg.author.username + 'たんの募集 〆```');
    } else {
      request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_a.image;
          const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_b.image;
          let txt = '@everyone 【ナワバリ募集】\n' + msg.author.username + 'たんがナワバリ中でし！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          txt += 'よければ合流しませんか？';
          const date = unixTime2mdwhm(data.regular[0].start_time) + ' – '
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
                }
              }
            })
          msg.guild.channels.find("name", "ナワバリ・フェス募集")
            .send({files: [stage_a, stage_b]});
        } else { msg.channel.send('なんかエラーでてるわ') }
      })
    }
  };

  if (msg.content.startsWith('run')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (strCmd.match("〆")) {
      msg.react('👌');
      msg.guild.channels.find("name", "サーモン募集")
        .send('``` ' + msg.author.username + 'たんの募集 〆```');
    } else {
      request.get('https://splatoon2.ink/data/coop-schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body);
          const stage = 'https://splatoon2.ink/assets/splatnet' + data.details[0].stage.image;
          let txt = '@everyone 【バイト募集】\n' + msg.author.username + 'たんがバイト中でし！\n';
          if (args.length > 0) txt += '[参加条件] ' + args.join(" ") + '\n';
          txt += 'よければ合流しませんか？';
          const date = unixTime2mdwhm(data.details[0].start_time) + ' – '
            + unixTime2mdwhm(data.details[0].end_time);
          const coop_stage = coop_stage2txt(data.details[0].stage.image) + '\n';
          const weapons = (data.details[0].weapons[0] ? weapon2txt(data.details[0].weapons[0].id) : '？') + '・'
            + (data.details[0].weapons[1] ? weapon2txt(data.details[0].weapons[1].id) : '？') + '・'
            + (data.details[0].weapons[2] ? weapon2txt(data.details[0].weapons[2].id) : '？') + '・'
            + (data.details[0].weapons[3] ? weapon2txt(data.details[0].weapons[3].id) : '？');

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

  // **********************************
  // ステージ情報
  // **********************************
  
  if (msg.content === 'show now') {
    
    request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const l_args = getLeague(data,0).split(",");
        const g_args = getGachi(data,0).split(",");
        sendStageInfo(msg, "　現在", l_args, g_args)
      } else {
        console.log('なんかエラーでてるわ') 
      }
    })

  } else if (msg.content === 'show next') {
    
    request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const l_args = getLeague(data,1).split(",");
        const g_args = getGachi(data,1).split(",");
        sendStageInfo(msg, "次", l_args, g_args)
      } else {
        console.log('なんかエラーでてるわ') 
      }
    })
    
  } else if (msg.content === 'show nawabari') {
    request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_a.image;
        const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_b.image;
        const date = unixTime2mdwhm(data.regular[0].start_time) + ' – '
          + unixTime2mdwhm(data.regular[0].end_time);
        const regular_stage = stage2txt(data.regular[0].stage_a.id) + '\n'
          + stage2txt(data.regular[0].stage_b.id) + '\n';

        msg.channel.send({
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
            }
          }
        })
      } else { msg.channel.send('なんかエラーでてるわ') }
    })
  } else if (msg.content === 'show run') {
    request.get('https://splatoon2.ink/data/coop-schedules.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const stage = 'https://splatoon2.ink/assets/splatnet' + data.details[0].stage.image;
        const date = unixTime2mdwhm(data.details[0].start_time) + ' – '
          + unixTime2mdwhm(data.details[0].end_time);
        const coop_stage = coop_stage2txt(data.details[0].stage.image) + '\n';
        const weapons = (data.details[0].weapons[0] ? weapon2txt(data.details[0].weapons[0].id) : '？') + '・'
          + (data.details[0].weapons[1] ? weapon2txt(data.details[0].weapons[1].id) : '？') + '・'
          + (data.details[0].weapons[2] ? weapon2txt(data.details[0].weapons[2].id) : '？') + '・'
          + (data.details[0].weapons[3] ? weapon2txt(data.details[0].weapons[3].id) : '？');

        msg.channel
          .send('', {
            "embed": {
              "author": {
                "name": "SALMON RUN",
                "icon_url": "https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png"
              },
              "title": date,
              "color": 16733696,
              "fields": [
                {
                  "name": "支給ブキ",
                  "value": weapons
                },
                {
                  "name": "ステージ",
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
  };


  if (msg.content.startsWith('fn')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react('👌');
      msg.guild.channels.find("name", "別ゲー募集")
        .send('```' + msg.author.username + 'たんの募集 〆```');
    } else {
      let txt = '@everyone 【Fortnite募集】\n' + msg.author.username + 'たんがFortniteメンバー募集中でし！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
        .send(txt, {
          files: ["https://cdn.glitch.com/6b791a64-15a8-4732-9fc4-9e01d48213be%2Ffortnite.jpg"]
        });
    }
  };

  if (msg.content.startsWith('mk')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react('👌');
      msg.guild.channels.find("name", "別ゲー募集")
        .send('``` ' + msg.author.username + 'たんの募集 〆```');
    } else {
      let txt = '@everyone 【マリオカート募集】\n' + msg.author.username + 'たんがマリオカート参加者募集中でし！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
        .send(txt, {
          files: ["https://cdn.glitch.com/6b791a64-15a8-4732-9fc4-9e01d48213be%2Fmk.png"]
        });
    }
  };


  if (msg.content.startsWith('mc')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.guild.channels.find("name", "別ゲー募集")
        .send('``` ' + msg.author.username + 'たんの募集 〆```');
    } else {
      let txt = '@everyone 【MINECRAFT募集】\n' + msg.author.username + 'たんがMINECRAFT参加者募集中でし！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
        .send(txt, {
          files: ["https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2FMinecraft.jpg"]
        });
    }
  };

  if (msg.content.startsWith('oc')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react('👌');
      msg.guild.channels.find("name", "別ゲー募集")
        .send(`<@!${msg.author.id}>たんの募集 〆`);
    } else {
      let txt = '@everyone 【オーバークック2募集】\n' + msg.author.username + 'たんがオーバークック2参加者募集中でし！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
        .send(txt, {
          files: ["https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fovercook.jpg"]
        });
    }
  };

  if (msg.content.startsWith('sb')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "〆") {
      msg.react('👌');
      msg.guild.channels.find("name", "別ゲー募集")
        .send('@here ' + msg.author.username + 'たんの募集 〆');
    } else {
      let txt = '@everyone 【スマブラSP募集】\n' + msg.author.username + 'たんがスマブラSP参加者募集中でし！\n';
      if (args.length > 0) txt += '[参加条件] ' + args.join(" ");
      msg.guild.channels.find("name", "別ゲー募集")
        .send(txt, {
          files: ["https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fsmash.jpg"]
        });
    }
  };

  // **********************************
  // ヘルプ
  // **********************************
  if (msg.content.startsWith('help')) {
    var strCmd = msg.content.replace(/　/g, " ");
    strCmd = strCmd.replace("  ", " ");
    const args = strCmd.split(" ");
    args.shift();
    if (args[0] == "2") {
      msg.channel.send('', {
        "embed": {
          "author": {
            "name": "ikabu_botの使い方(2/2)",
            "icon_url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg"
          },
          "title": "ikabu_botの使い方(2/2)",
          "color": 0x1bc2a5,
          "fields": [
            {
              "name": "ステージ情報を表示[now / next / nawabari / run]",
              "value": "```show ○○○```\n"
            },
            {
              "name": "ランダム系コマンド",
              "value": "ブキをランダムで選出：```buki 複数の場合は数字を記入```\n"
              + "ブキ種別ごとのランダム選出方法を表示：```buki help```\n"
              + "ガチルールをランダムで選出：```rule```\n"
              + "ガチルールとステージをランダムで選出：```rule stage```\n"
              + "サブウェポンをランダムで選出：```sub```\n"
              + "スペシャルウェポンをランダムで選出：```special```"
            },
            {
              "name": "選択肢の中からランダム選出",
              "value": "```pick 複数選出の場合は数字を記入 選択肢を半スペ空け or 改行して記入```"
            },
            {
              "name": "接続してるボイチャから数字分のヒトをランダム抽出",
              "value": "```vpick 複数選出の場合は数字を記入```"
            },
            {
              "name": "プラベの観戦者を抽出",
              "value": "```kansen 試合回数分の数字を記入```"
            }
          ],
        }
      })
    } else {
      msg.channel.send('', {
        "embed": {
          "author": {
            "name": "ikabu_botの使い方(1/2)",
            "icon_url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg"
          },
          "title": "ikabu_botの使い方(1/2)",
          "color": 0x1bc2a5,
          "fields": [
            {
              "name": "botのコメンド一覧を表示",
              "value": "```help または help 2```"
            },
            {
              "name": "現在のリグマ情報を表示して募集",
              "value": "```now 参加条件があれば記載```\n"
            },
            {
              "name": "次回のリグマ情報を表示して募集",
              "value": "```next 参加条件があれば記載```\n"
            },
            {
              "name": "現在のナワバリ情報を表示して募集",
              "value": "```nawabari 参加条件があれば記載```\n"
            },
            {
              "name": "サーモンラン情報を表示して募集",
              "value": "```run 参加条件があれば記載```\n"
            },
            {
              "name": "別ゲー募集コマンド",
              "value": "フォートナイト：```fn 参加条件があれば記載```\n"
              + "マリオカート：```mk 参加条件があれば記載```\n"
              // + "MINECRAFT：```mc 参加条件があれば記載```\n"
              // + "オーバークック2：```oc 参加条件があれば記載```\n"
              + "スマブラSP：```sb 参加条件があれば記載```\n"
            },
            {
              "name": "ヒメ派のフェスメンバーを募集",
              "value": "```fes a 参加条件があれば記載```"
            },
            {
              "name": "イイダ派のフェスメンバーを募集",
              "value": "```fes b 参加条件があれば記載```"
            },
            {
              "name": "役職に応じて自動でフェスメンバーを募集\n※ヒメ派、イイダ派どちらかを投票して役職がついてる場合のみ",
              "value": "```fes 参加条件があれば記載```"
            }
          ],
        }
      })
    }
  };
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  guild.channels.find("id", "414095683746922517")
    .send(`<@!${member.user.id}> たん、よろしくお願いします！\nまずは ${guild.channels.find("id", "477067128479023115")} と ${guild.channels.find("id", "477067552015515658")} をよく読んでから ${guild.channels.find("id", "417591840250920971")} で自己紹介も兼ねて自分のフレコを貼ってください\n\n${guild.name}のみんなが歓迎していますよ〜`)
    .then(sentMessage => sentMessage.react('👍'));
});

client.login(process.env.DISCORD_BOT_TOKEN);

function isInteger(x) {
    return Math.round(x) === x;
}

function getLeague(data,x) {
 
  let stage;
  let date;
  let rule;
  let rstr;
  date = unixTime2mdwhm(data.league[x].start_time) + ' – '
    + unixTime2hm(data.league[x].end_time)
  rule = rule2txt(data.league[x].rule.key)
  stage = stage2txt(data.league[x].stage_a.id) + '\n'
    + stage2txt(data.league[x].stage_b.id) + '\n'
  rstr = date + "," + rule + "," + stage  
  console.log(rstr);
  return rstr;
}

function getGachi(data,x) {
 
  let stage;
  let date;
  let rule;
  let rstr;
  date = unixTime2mdwhm(data.gachi[x].start_time) + ' – '
    + unixTime2hm(data.gachi[x].end_time)
  rule = rule2txt(data.gachi[x].rule.key)
  stage = stage2txt(data.gachi[x].stage_a.id) + '\n'
    + stage2txt(data.gachi[x].stage_b.id) + '\n'
  rstr = date + "," + rule + "," + stage  
  console.log(rstr);
  return rstr;
}

function sendStageInfo(msg,title,l_args,g_args) {
  var l_date = l_args[0];
  var l_rule = l_args[1];
  var l_stage = l_args[2];
  var g_date = g_args[0];
  var g_rule = g_args[1];
  var g_stage = g_args[2];

  msg.channel.send({
    "embed": {
      "author": {
        "name": title + "のリーグマッチ",
        "icon_url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
      },
      "color": 0xf02d7d,
      "fields": [
        {
          "name": l_date + '　' + l_rule,
          "value": l_stage
        }
      ],
      "thumbnail": {
        "url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
      }
    }
  })
  msg.channel.send({
    "embed": {
      "author": {
        "name": title + "のガチマッチ",
        "icon_url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png"
      },
      "color": 0xf02d7d,
      "fields": [
        {
          "name": g_date + '　' + g_rule,
          "value": g_stage
        }
      ],
      "thumbnail": {
        "url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png"
      }
    }
  })
}

function sendLeagueMatch(msg,txt,l_args) {
  var l_date = l_args[0];
  var l_rule = l_args[1];
  var l_stage = l_args[2];
  var tuhmbnail_url;
  
  if (l_rule=='ガチエリア') {
    tuhmbnail_url = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png"
  } else if (l_rule=='ガチヤグラ') {
    tuhmbnail_url = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png"
  } else if (l_rule=='ガチホコバトル') {
    tuhmbnail_url = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png"
  } else if (l_rule=='ガチアサリ') {
    tuhmbnail_url = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png"
  } else {
    tuhmbnail_url = "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
  }
  
  msg.guild.channels.find("name", "リグマ募集")
    .send(txt, {
      "embed": {
        "author": {
          "name": "リーグマッチ",
          "icon_url": "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png"
        },
        "color": 0xf02d7d,
        "fields": [
          {
            "name": l_date + '　' + l_rule,
            "value": l_stage
          }
        ],
        "thumbnail": {
          "url": tuhmbnail_url
        }
      }
    })
}

