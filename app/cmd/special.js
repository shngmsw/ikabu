const specialweapons = {
  0: 'ジェットパック',
  1: 'スーパーチャクチ',
  2: 'マルチミサイル',
  3: 'ハイパープレッサー',
  4: 'アメフラシ',
  5: 'ボムピッチャー',
  6: 'インクアーマー',
  7: 'イカスフィア',
  8: 'バブルランチャー',
  9: 'ナイスダマ',
  10: 'ウルトラハンコ',
};

module.exports = function handleSpecial(msg) {
  var special = specialweapons[Math.floor(Math.random() * 10)];
  msg.reply('`' + special + '`でし！');
};
