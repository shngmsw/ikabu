// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require('discord.js');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { Combination } = require('js-combinatorics');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = async function handleKansen(interaction: $TSFixMe) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    const how_many_times = options.getInteger('回数');

    var resultList = new Array();
    var cmb = new Combination(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 2);
    var tmp_watching_list = cmb.toArray();
    if (how_many_times > 20) {
        await interaction.followUp({
            content: '20回以下じゃないとダメでし！',
            ephemeral: true,
        });
        return;
    }
    if (how_many_times <= 0) {
        await interaction.followUp({
            content: '1以上じゃないとダメでし！',
            ephemeral: true,
        });
        return;
    }

    for (let i = 0; i < how_many_times; i++) {
        // next watchersが一人になったらリストを再生成
        if (tmp_watching_list.length <= 1) {
            var baseNum = 0;
            var choose_comb = tmp_watching_list[baseNum];
            resultList.push(i + 1 + '回目：' + choose_comb);
            var tmp_watching_list = cmb.toArray();
        } else {
            var baseNum = Math.floor(Math.random() * tmp_watching_list.length);
            var choose_comb = tmp_watching_list[baseNum];

            resultList.push(i + 1 + '回目：' + choose_comb);

            // now watching usersをnext watchersから取り除く
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players: $TSFixMe) {
                if (players[0] != choose_comb[0]) {
                    return players;
                }
            });
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players: $TSFixMe) {
                if (players[1] != choose_comb[0]) {
                    return players;
                }
            });
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players: $TSFixMe) {
                if (players[0] != choose_comb[1]) {
                    return players;
                }
            });
            tmp_watching_list = tmp_watching_list.filter(function exclude_previous_watcher(players: $TSFixMe) {
                if (players[1] != choose_comb[1]) {
                    return players;
                }
            });
        }
    }

    var emb = new EmbedBuilder().setColor(0xf02d7d).addFields([{ name: '観戦の人', value: resultList.join('\n') }]);
    await interaction.editReply({ embeds: [emb] });
};
