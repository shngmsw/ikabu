import path from 'node:path';

import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { log4js_obj } from '@/infra/logging/log4js';

import { fortunes, omikujiAnimationDuration } from './fortunes';

const logger = log4js_obj.getLogger('omikuji');
const assetDirectory = path.resolve('images/omikuji');

export async function handleOmikuji(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    const content = `**${fortune.name}**でし！\n${fortune.message}`;
    const textResult = { content, embeds: [], attachments: [], allowedMentions: { parse: [] } };

    try {
        await interaction.editReply({
            content: 'からから…… 運勢を占っているでし！',
            embeds: [new EmbedBuilder().setColor(0xe5b957).setImage('attachment://drawing.gif')],
            files: [
                new AttachmentBuilder(path.join(assetDirectory, 'drawing.gif')).setDescription(
                    'おみくじの筒を振ると、くじ棒が飛び出すアニメーション',
                ),
            ],
            allowedMentions: { parse: [] },
        });
    } catch (error) {
        logger.warn('おみくじの演出を送信できなかったため、文字で結果を返します。', error);
        await interaction.editReply(textResult);
        return;
    }

    // GIF を送信し終えてから待つことで、アップロード時間で演出を短縮しない。
    await new Promise<void>((resolve) => setTimeout(resolve, omikujiAnimationDuration));

    try {
        await interaction.editReply({
            content,
            attachments: [],
            embeds: [
                new EmbedBuilder().setColor(fortune.color).setImage('attachment://result.png'),
            ],
            files: [
                new AttachmentBuilder(path.join(assetDirectory, `${fortune.id}.png`), {
                    name: 'result.png',
                }).setDescription(`おみくじの結果：${fortune.name}。${fortune.message}`),
            ],
            allowedMentions: { parse: [] },
        });
    } catch (error) {
        logger.warn('おみくじの結果画像を送信できなかったため、文字で結果を返します。', error);
        await interaction.editReply(textResult);
    }
}
