const wiki = require('wikijs').default;
const { EmbedBuilder } = require('discord.js');
const log4js = require('log4js');

module.exports = async function handleWiki(interaction) {
    log4js.configure(process.env.LOG4JS_CONFIG_PATH);
    const logger = log4js.getLogger('interaction');
    try {
        if (!interaction.isCommand()) return;
        // 'インタラクションに失敗'が出ないようにするため
        await interaction.deferReply();

        const { options } = interaction;
        const word = options.getString('キーワード');
        let wikipedia = wiki({ apiUrl: 'http://ja.wikipedia.org/w/api.php' });
        let data = await wikipedia.search(word);
        let page = await wikipedia.page(data.results[0]);
        let summary = await page.summary();
        let imageURL = await page.mainImage();
        let url = page.url();
        if (summary === '') {
            await interaction.followUp({ content: '見つからなかったでし！', ephemeral: false });
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
    } catch (err) {
        logger.error(err.name + ': ' + err.message);
    }
};
