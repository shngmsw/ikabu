const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const log4js = require('log4js');

module.exports = {
    sendCloseButton: sendCloseButton,
};

const logger = log4js.getLogger('default');

async function sendCloseButton(thread) {
    try {
        const buttons = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('support_resolved').setLabel('回答終了(クローズ)').setStyle(ButtonStyle.Success),
        ]);

        const embed = new EmbedBuilder();
        embed.setTitle('サポートの開始');
        embed.setDescription('回答がつくまで待つでし！\n管理者は質問の回答や問題の解決が終わったら回答終了ボタンを押すでし！');
        await thread.send({ embeds: [embed], components: [buttons] });
    } catch (error) {
        logger.error(error);
    }
}
