const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { start } = require('repl');
const { URLSearchParams } = require('url');

module.exports = {
    privateRecruit: privateRecruit,
};

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
        await interaction.reply({ content: '募集完了でし！参加者が来るまで気長に待つでし！', ephemeral: true });
        const sentMessage = await interaction.channel.send({
            content: `@everyone \n<@${interaction.member.id}>たんがプライベートマッチ募集中でし！`,
            embeds: [embed],
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitActionRow(sentMessage)] });
        setTimeout(function () {
            const host_mention = `@${interaction.member.id}>`;
            sentMessage.edit({
                content: `${host_mention}たんの募集は〆！`,
                components: [disableButtons()],
            });
        }, 7200000);
    } catch (error) {
        console.log(error);
    }
}

function recruitActionRow(msg) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('mid', msg.id);
    cancelParams.append('cid', msg.channel.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('mid', msg.id);
    closeParams.append('cid', msg.channel.id);

    return new MessageActionRow().addComponents([
        new MessageButton().setCustomId(joinParams.toString()).setLabel('参加').setStyle('PRIMARY'),
        new MessageButton().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle('DANGER'),
        new MessageButton().setCustomId(closeParams.toString()).setLabel('〆').setStyle('SECONDARY'),
    ]);
}
function disableButtons() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('join').setLabel('参加').setStyle('PRIMARY').setDisabled(),
        new MessageButton().setCustomId('cancel').setLabel('キャンセル').setStyle('DANGER').setDisabled(),
        new MessageButton().setCustomId('close').setLabel('〆').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}
