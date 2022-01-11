const common = require("./common.js");

module.exports = function handleTimer(msg, args) {
  var kazu = Number(args);
  var count = kazu;
  if (count <= 10 && count > 0 && common.isInteger(kazu)) {
    msg.reply("タイマーを" + count + "分後にセットしたでし！");
    var countdown = function () {
      count--;
      if (count != 0) {
        msg.reply("残り" + count + "分でし");
      } else {
        msg.reply("時間でし！");
      }
    };
    var id = setInterval(function () {
      countdown();
      if (count <= 0) {
        clearInterval(id);
      }
    }, 60000);
  } else {
    msg.reply("10分以内しか入力できないでし！正の整数以外もダメでし！");
  }
};
