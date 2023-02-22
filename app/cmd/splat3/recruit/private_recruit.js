const { EmbedBuilder } = require('discord.js');
const { searchMessageById } = require('../../../manager/messageManager');
const { searchMemberById } = require('../../../manager/memberManager');
const { isNotEmpty, sleep } = require('../../../common');
const {
    embedRecruitDeleteButton,
    recruitActionRow,
    notifyActionRow,
} = require('../../../buttons/recruit/components/create_recruit_buttons');
const e = require('express');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruit');

module.exports = {
    privateRecruit: privateRecruit,
};

async function privateRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;

    // 募集がfollowUpでないとリグマと同じfunctionでeditできないため
    await interaction.deferReply();

    if (options.getSubcommand() === 'recruit') {
        await sendPrivateRecruit(interaction, options);
    } else if (options.getSubcommand() === 'button') {
        await sendNotification(interaction);
    }
}

async function sendPrivateRecruit(interaction, options) {
    let start_time = interaction.options.getString('開始時刻');
    let time = interaction.options.getString('所要時間');
    let recruitNumText = options.getString('募集人数');

    let condition = options.getString('内容または参加条件');
    let logo = 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/Private-battles-badge%402x.png';
    const guild = await interaction.guild.fetch();
    const host_member = await searchMemberById(guild, interaction.member.user.id);
    let authorName = host_member.displayName;
    let authorAvatarUrl = host_member.avatarURL();

    const embed = new EmbedBuilder()
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
            content: `<@${interaction.member.id}>**たんのプライベートマッチ募集**`,
            embeds: [embed],
            ephemeral: false,
        });

        const mention = `@everyone`;
        const sentMessage = await interaction.channel.send({
            content: mention + ` ボタンを押して参加表明するでし！`,
        });
        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitActionRow(header)] });
        let deleteButtonMsg = await interaction.channel.send({
            components: [embedRecruitDeleteButton(sentMessage, header)],
        });

        await interaction.followUp({
            content: '募集完了でし！参加者が来るまで気長に待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });

        // ピン留め
        header.pin();

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, interaction.channel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}

async function sendNotification(interaction) {
    const mention = `@everyone`;
    const sentMessage = await interaction.editReply({
        content: mention + ` ボタンを押して参加表明するでし！`,
    });
    // ピン留め
    sentMessage.pin();
    await interaction.followUp({
        content: '募集完了でし！参加者が来るまで気長に待つでし！',
        ephemeral: true,
    });
    // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
    sentMessage.edit({ components: [notifyActionRow(interaction.member.id)] });
}
