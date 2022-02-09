const common = require('../common.js');
module.exports = function handlePick(msg) {
  var strCmd = msg.content.replace(/　/g, ' ');
  strCmd = msg.content.replace(/\r?\n/g, ' ');
  const args = strCmd.split(' ');
  args.shift();
  // Math.random() * ( 最大値 - 最小値 ) + 最小値;
  var picked = args[Math.floor(Math.random() * args.length)];
  var kazu = Number(args[0]);
  if (kazu) {
    args.shift();
    var picked = common.random(args, kazu).join('\n');
  } else {
    var picked = args[Math.floor(Math.random() * args.length)];
  }
  msg.reply({ content: picked + 'でし！' });
};
