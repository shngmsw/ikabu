module.exports = async function handleVoicePick(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    // 発言したヒトが接続してるボイチャから数字分のヒトをランダム抽出
    // 数字なしの場合は１人をランダム抽出

    var kazu = Number(options.getInteger('ピックする人数'));
    let user = '';
    if (kazu) {
        user = interaction.member.voice.channel.members.random(kazu);
    } else {
        user = interaction.member.voice.channel.members.random(1);
    }
    interaction.editReply({ content: `${user}` });
};
