const { MessageEmbed } = require('discord.js');
const Combinatorics = require('js-combinatorics');
const common = require('../common.js');

module.exports = async function handleKansen(msg, args) {
  var how_many_times = Number(args);
  var resultList = new Array();
  var cmb = Combinatorics.combination(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 2);
  var tmp_watching_list = cmb.toArray();
  var result = '';
  if (!common.isInteger(how_many_times) || how_many_times <= 0) {
    msg.reply('1以上の整数じゃないとダメでし！');
    return;
  } else if (how_many_times > 20) {
    msg.reply('20回未満じゃないとダメでし！');
    return;
  }

  for (let i = 0; i < how_many_times; i++) {
    // next watchersが一人になったらリストを再生成
    if (tmp_watching_list.length <= 1) {
      var baseNum = 0;
      var choose_comb = tmp_watching_list[baseNum];
      resultList.push(i + 1 + '回目：' + choose_comb);
      var tmp_watching_list = cmb.toArray();
    } else {
      var baseNum = Math.floor(Math.random() * tmp_watching_list.length);
      var choose_comb = tmp_watching_list[baseNum];

      resultList.push(i + 1 + '回目：' + choose_comb);

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
    }
  }

  var emb = new MessageEmbed().setColor(0xf02d7d).addFields([{ name: '観戦の人', value: resultList.join('\n') }]);

  var pin_msg = await msg.channel.send({ embeds: [emb] });
  pin_msg.pin();
  var count = how_many_times * 8;
  if (count > 0) {
    var countdown = function () {
      count--;
    };
    var id = setInterval(function () {
      countdown();
      if (count <= 0) {
        clearInterval(id);
        pin_msg.unpin();
      }
    }, 60000);
  }
};
