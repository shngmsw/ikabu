// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    sendCloseButton: sendCloseButton,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('default');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendCloseB... Remove this comment to see the full error message
async function sendCloseButton(thread: $TSFixMe) {
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
