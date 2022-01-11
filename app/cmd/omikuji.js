const common = require("./common.js");
const kujis = {
  0: "大吉",
  1: "吉",
  2: "中吉",
  3: "小吉",
  4: "末吉",
  5: "凶",
  6: "大凶",
};
module.exports = function handleOmikuji(msg) {
  const kuji = kujis[Math.floor(Math.random() * 7)];
  msg.reply("`" + kuji + "`でし！");
};
