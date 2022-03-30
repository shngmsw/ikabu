const wiki = require('wikijs').default;
const { MessageEmbed } = require('discord.js');

module.exports = async function handleWiki(msg, word) {
    try {
        let wikipedia = wiki({ apiUrl: 'http://ko.wikipedia.org/w/api.php' });
        let data = await wikipedia.search(word);
        let page = await wikipedia.page(data.results[0]);
        let summary = await page.summary();
        let imageURL = await page.mainImage();
        let url = page.url();
        const embed = new MessageEmbed()
            .setTitle(page.raw.title)
            .setURL(decodeURI(url))
            .setColor(0xf02d7d)
            .addFields({
                name: 'summary',
                value: summary.substring(0, 300),
            })
            .setImage(decodeURI(imageURL));

        msg.channel.send({ embeds: [embed] });
    } catch (err) {
        console.log(err.name + ': ' + err.message);
    }
};
