const common = require("./common.js");
const rules = {
  0: "ガチエリア",
  1: "ガチヤグラ",
  2: "ガチホコ",
  3: "ガチアサリ",
};

module.exports = function handleRule(msg) {
  // console.log(rules);
  if (msg.content.startsWith("rule stage")) {
    var stage = common.stage2txt(Math.floor(Math.random() * 23).toString());
    msg.channel.send("`" + stage + "`でし！");
  } else if (msg.content.startsWith("rule")) {
    var rule = rules[Math.floor(Math.random() * 4)];
    msg.channel.send("`" + rule + "`でし！");
  }
};
