// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'common'.
const common = require("../../common/others");
// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = async function handlePick(interaction: $TSFixMe) {
  if (!interaction.isCommand()) return;
  // 'インタラクションに失敗'が出ないようにするため
  await interaction.deferReply();

  const { options } = interaction;
  const pickNum = options.getInteger("ピックする数");
  const choices = options.getString("選択肢");

  var strCmd = choices.replace(/　/g, " ");
  strCmd = choices.replace(/\r?\n/g, " ");
  const args = strCmd.split(" ");
  // Math.random() * ( 最大値 - 最小値 ) + 最小値;
  var picked = args[Math.floor(Math.random() * args.length)];
  var kazu = Number(pickNum);
  if (kazu) {
    args.shift();
    var picked = common.random(args, kazu).join("\n");
  } else {
    var picked = args[Math.floor(Math.random() * args.length)];
  }
  await interaction.editReply({ content: picked + "でし！" });
};
