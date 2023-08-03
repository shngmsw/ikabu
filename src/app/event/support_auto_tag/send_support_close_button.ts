import {
    ActionRowBuilder,
    AnyThreadChannel,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('default');

export async function sendCloseButton(thread: AnyThreadChannel<boolean>) {
    try {
        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
                .setCustomId('support_resolved')
                .setLabel('回答終了(クローズ)')
                .setStyle(ButtonStyle.Success),
        ]);

        const embed = new EmbedBuilder();
        embed.setTitle('サポートの開始');
        embed.setDescription(
            '回答がつくまで待つでし！\n管理者は質問の回答や問題の解決が終わったら回答終了ボタンを押すでし！',
        );
        await thread.send({ embeds: [embed], components: [buttons] });
    } catch (error) {
        logger.error(error);
    }
}
