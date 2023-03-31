import { randomSelect } from '../../common/others';
export async function handlePick(interaction: $TSFixMe) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    const pickNum = options.getInteger('ピックする数');
    const choices = options.getString('選択肢');

    let strCmd = choices.replace(/　/g, ' ');
    strCmd = choices.replace(/\r?\n/g, ' ');
    const args = strCmd.split(' ');
    // Math.random() * ( 最大値 - 最小値 ) + 最小値;
    let picked = args[Math.floor(Math.random() * args.length)];
    const kazu = Number(pickNum);
    if (kazu) {
        args.shift();
        picked = randomSelect(args, kazu).join('\n');
    } else {
        picked = args[Math.floor(Math.random() * args.length)];
    }
    await interaction.editReply({ content: picked + 'でし！' });
}
