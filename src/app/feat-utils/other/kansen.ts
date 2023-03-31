import { EmbedBuilder } from 'discord.js';
import { Combination } from 'js-combinatorics';

export async function handleKansen(interaction: $TSFixMe) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    const how_many_times = options.getInteger('回数');

    const resultList = [];
    const cmb = new Combination(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 2);
    let tmp_watching_list = cmb.toArray();
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
        let baseNum;
        let choose_comb: string[];
        if (tmp_watching_list.length <= 1) {
            baseNum = 0;
            choose_comb = tmp_watching_list[baseNum];
            resultList.push(i + 1 + '回目：' + choose_comb);
            tmp_watching_list = cmb.toArray();
        } else {
            baseNum = Math.floor(Math.random() * tmp_watching_list.length);
            choose_comb = tmp_watching_list[baseNum];

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

    const emb = new EmbedBuilder().setColor(0xf02d7d).addFields([{ name: '観戦の人', value: resultList.join('\n') }]);
    await interaction.editReply({ embeds: [emb] });
}
