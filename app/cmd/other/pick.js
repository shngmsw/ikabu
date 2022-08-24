const app = require('app-root-path').resolve('app');
const common = require(app + '/common.js');
module.exports = async function handlePick(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    const pickNum = options.getInteger('ピックする数');
    const choices = options.getString('選択肢');

    var strCmd = choices.replace(/　/g, ' ');
    strCmd = choices.replace(/\r?\n/g, ' ');
    const args = strCmd.split(' ');
    // Math.random() * ( 最大値 - 最小値 ) + 最小値;
    var picked = args[Math.floor(Math.random() * args.length)];
    var kazu = Number(pickNum);
    if (kazu) {
        args.shift();
        var picked = common.random(args, kazu).join('\n');
    } else {
        var picked = args[Math.floor(Math.random() * args.length)];
    }
    interaction.editReply({ content: picked + 'でし！' });
};
