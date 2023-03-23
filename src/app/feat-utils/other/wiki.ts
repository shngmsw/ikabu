// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'wiki'.
const wiki = require("wikijs").default;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require("discord.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = async function handleWiki(interaction: $TSFixMe) {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  log4js.configure(process.env.LOG4JS_CONFIG_PATH);
  const logger = log4js.getLogger("interaction");
  try {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    const { options } = interaction;
    const word = options.getString("キーワード");
    let wikipedia = wiki({ apiUrl: "http://ja.wikipedia.org/w/api.php" });
    let data = await wikipedia.search(word);
    let page = await wikipedia.page(data.results[0]);
    let summary = await page.summary();
    let imageURL = await page.mainImage();
    let url = page.url();
    if (summary === "") {
      await interaction.followUp({
        content: "見つからなかったでし！",
        ephemeral: false,
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(page.raw.title)
      .setURL(decodeURI(url))
      .setColor(0xf02d7d)
      .addFields({
        name: "概要",
        value: summary.substring(0, 300),
      })
      .setImage(decodeURI(imageURL));

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    logger.error(err.name + ": " + err.message);
  }
};
