const wiki = require("wikijs").default;

module.exports = async function handleWiki(msg, word) {
    try {
        let wikipedia = wiki({ apiUrl: "http://ja.wikipedia.org/w/api.php" });
        let data = await wikipedia.search(word);
        let page = await wikipedia.page(data.results[0]);
        let summary = await page.summary();
        let imageURL = await page.mainImage();
        let url = await page.url();

        var emb = {
            embed: {
                color: 0xf02d7d,
                title: page.raw.title,
                url: decodeURI(url),
                fields: [{ name: "概要", value: summary }],
                image: {
                    url: decodeURI(imageURL)
                }
            }
        };
        msg.channel.send(emb);
    } catch (err) {
        console.log(err.name + ': ' + err.message);
    }
}
