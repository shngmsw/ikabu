const subweapons = {
  0: "スプラッシュボム",
  1: "キューバンボム",
  2: "クイックボム",
  3: "スプリンクラー",
  4: "ジャンプビーコン",
  5: "スプラッシュシールド",
  6: "ポイントセンサー",
  7: "トラップ",
  8: "カーリングボム",
  9: "ロボットボム",
  10: "ポイズンミスト",
  11: "タンサンボム",
  12: "トーピード",
};

module.exports = function handleSub(msg) {
  var sub = subweapons[Math.floor(Math.random() * 12)];
  msg.channel.send("`" + sub + "`でし！");
};
