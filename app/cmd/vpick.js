module.exports = function handleVoicePick(msg) {
  // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
  // 数字なしの場合は１人をランダム抽出
  var strCmd = msg.content.replace(/　/g, " ");
  const args = strCmd.split(" ");
  args.shift();
  var kazu = Number(args[0]);
  if (kazu) {
    msg.channel.send(msg.member.voice.channel.members.random(kazu));
  } else {
    msg.channel.send(msg.member.voice.channel.members.random(1));
  }
};
