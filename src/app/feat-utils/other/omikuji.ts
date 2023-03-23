const kujis = {
  0: "大吉",
  1: "吉",
  2: "中吉",
  3: "小吉",
  4: "末吉",
  5: "凶",
  6: "大凶",
};
// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = function handleOmikuji(msg: $TSFixMe) {
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const kuji = kujis[Math.floor(Math.random() * 7)];
  msg.reply("`" + kuji + "`でし！");
};
