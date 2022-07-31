const common = require('../common.js');

module.exports = async function handleTimer(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    var kazu = options.getInteger('分');
    var count = kazu;
    if (count <= 10 && count > 0 && common.isInteger(kazu)) {
        interaction.editReply('タイマーを' + count + '分後にセットしたでし！');
        var countdown = function () {
            count--;
            if (count != 0) {
                interaction.editReply(`残り${count}分でし`);
            } else {
                interaction.followUp(`<@${interaction.member.user.id}> 時間でし！`);
            }
        };
        var id = setInterval(function () {
            countdown();
            if (count <= 0) {
                clearInterval(id);
            }
        }, 60000);
    } else {
        interaction.editReply('10分以内しか入力できないでし！');
    }
};
