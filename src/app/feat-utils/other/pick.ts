import { randomSelect } from "../../common/others";
export async function handlePick(interaction: $TSFixMe) {
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
    var picked: any = randomSelect(args, kazu).join("\n");
  } else {
    var picked = args[Math.floor(Math.random() * args.length)];
  }
  await interaction.editReply({ content: picked + "でし！" });
};
