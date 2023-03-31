import wiki from 'wikijs';
import { EmbedBuilder } from 'discord.js';
import { log4js_obj } from '../../../log4js_settings';

export async function handleWiki(interaction: $TSFixMe) {
    const logger = log4js_obj.getLogger('interaction');
    try {
        if (!interaction.isCommand()) return;
        // 'インタラクションに失敗'が出ないようにするため
        await interaction.deferReply();

        const { options } = interaction;
        const word = options.getString('キーワード');
        const wikipedia = wiki({ apiUrl: 'http://ja.wikipedia.org/w/api.php' });
        const data = await wikipedia.search(word);
        const page = await wikipedia.page(data.results[0]);
        const summary = await page.summary();
        const imageURL = await page.mainImage();
        const url = page.url();
        if (summary === '') {
            await interaction.followUp({
                content: '見つからなかったでし！',
                ephemeral: false,
            });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(page.raw.title)
            .setURL(decodeURI(url))
            .setColor(0xf02d7d)
            .addFields({
                name: '概要',
                value: summary.substring(0, 300),
            })
            .setImage(decodeURI(imageURL));

        await interaction.editReply({ embeds: [embed] });
    } catch (err: $TSFixMe) {
        logger.error(err.name + ': ' + err.message);
    }
}
