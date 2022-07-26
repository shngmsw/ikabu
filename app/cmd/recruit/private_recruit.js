const { MessageEmbed } = require('discord.js');
const { recruitDeleteButton, recruitActionRow, disableButtons } = require('./button_components.js');

module.exports = {
    privateRecruit: privateRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function privateRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    let start_time = interaction.options.getString('開始時刻');
    let time = interaction.options.getString('所要時間');
    let recruitMinNum = options.getInteger('募集人数');
    let recruitMaxNum = options.getInteger('最大人数');
    if (recruitMinNum <= 0) {
        await interaction.reply({
            content: 'デバッグしようとする頭の良い子は嫌いでし！',
            ephemeral: true,
        });
        return;
    }
    if (recruitMaxNum != null && recruitMaxNum <= 0) {
        await interaction.reply({
            content: 'デバッグしようとする頭の良い子は嫌いでし！',
            ephemeral: true,
        });
        return;
    }
    if (recruitMaxNum != null && recruitMinNum >= recruitMaxNum) {
        await interaction.reply({
            content: '最大人数に募集人数より少ない数は設定できないでし！',
            ephemeral: true,
        });
        return;
    }
    let recruitNumText = recruitMinNum.toString();
    if (recruitMaxNum != null) recruitNumText = recruitNumText + `～` + recruitMaxNum.toString();
    let condition = options.getString('内容または参加条件');
    let logo = 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/Private-battles-badge%402x.png';
    let authorName = interaction.member.nickname == null ? interaction.member.user.username : interaction.member.nickname;
    let authorAvatarUrl = interaction.member.user.avatarURL();

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
                value: '＠' + recruitNumText,
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
        await interaction.reply({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });
        const sentMessage = await interaction.channel.send({
            content: `@everyone \n<@${interaction.member.id}>たんがプライベートマッチ募集中でし！`,
            embeds: [embed],
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitDeleteButton(sentMessage, interaction.member)] });

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        let cmd_message = await interaction.channel.messages.cache.get(sentMessage.id);
        if (cmd_message != undefined) {
            sentMessage.edit({ components: [recruitActionRow(sentMessage, interaction.member)] });
        } else {
            return;
        }
    } catch (error) {
        console.log(error);
    }
}
