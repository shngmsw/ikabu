const wiki = require('wikijs').default;
const { MessageEmbed } = require('discord.js');

module.exports = async function handleWiki(interaction) {
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
            interaction.followUp({ content: '見つからなかったでし！', ephemeral: false });
            return;
        }
        const embed = new MessageEmbed()
            .setTitle(page.raw.title)
            .setURL(decodeURI(url))
            .setColor(0xf02d7d)
            .addFields({
                name: '概要',
                value: summary.substring(0, 300),
            })
            .setImage(decodeURI(imageURL));

        interaction.editReply({ embeds: [embed] });
    } catch (err) {
        console.log(err.name + ': ' + err.message);
    }
};
