const { MessageEmbed } = require('discord.js');
const { recruitDeleteButton, recruitActionRow } = require('./button_components.js');

module.exports = {
    privateRecruit: privateRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function privateRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    let start_time = interaction.options.getString('開始時刻');
    let time = interaction.options.getString('所要時間');
    let recruitNumText = options.getString('募集人数');

    let condition = options.getString('内容または参加条件');
    let logo = 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/Private-battles-badge%402x.png';
    let authorName = interaction.member.nickname == null ? interaction.member.user.username : interaction.member.nickname;
    let authorAvatarUrl = interaction.member.user.avatarURL();

    // 募集がfollowUpでないとリグマと同じfunctionでeditできないため
    await interaction.deferReply();

    const embed = new MessageEmbed()
        .setAuthor({
            name: authorName,
            iconURL: authorAvatarUrl,
        })
        .setTitle('プライベートマッチ募集')
        .addFields([
            {
                name: '開始時刻',
                value: start_time,
            },
            {
                name: '所要時間',
                value: time,
            },
            {
                name: '募集人数',
                value: recruitNumText,
            },
            {
                name: 'プラベ内容または参加条件',
                value: condition == null ? 'なし' : condition,
            },
        ])
        .setColor('#5900b7')
        .setTimestamp()
        .setThumbnail(logo);

    try {
        const header = await interaction.editReply({
            content: `<@${interaction.member.id}>たんがプライベートマッチ募集中でし！`,
            embeds: [embed],
            ephemeral: false,
        });

        const mention_id = searchRoleIdByName(interaction.guild, 'スプラ2');
        const mention = `<@&${mention_id}>`;
        const sentMessage = await interaction.channel.send({
            content: mention + ` ボタンを押して参加表明するでし！`,
        });
        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitDeleteButton(sentMessage, header)] });

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        let cmd_message = await interaction.channel.messages.cache.get(sentMessage.id);
        if (cmd_message != undefined) {
            sentMessage.edit({ components: [recruitActionRow(header)] });
        } else {
            return;
        }
    } catch (error) {
        console.log(error);
    }
}
