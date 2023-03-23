// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fetch'.
const fetch = require("node-fetch");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require("../../common/manager/member_manager");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'common'.
const common = require("../../common/others");
const weaponsUrl = "https://stat.ink/api/v3/weapon";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'EmbedBuild... Remove this comment to see the full error message
const { EmbedBuilder } = require("discord.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger("interaction");

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = async function handleBuki(interaction: $TSFixMe) {
  if (!interaction.isCommand()) return;
  // 'インタラクションに失敗'が出ないようにするため
  await interaction.deferReply();
  buki(interaction);
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'buki'.
async function buki(interaction: $TSFixMe) {
  const { options } = interaction;
  let bukiType = options.getString("ブキ種");
  let amount = options.getInteger("ブキの数");
  if (amount > 10) {
    await interaction.followUp("一度に指定できるのは10個まででし！");
    return;
  }

  try {
    const response = await fetch(weaponsUrl);
    const weapons = await response.json();
    const guild = await interaction.guild.fetch();
    const member = await searchMemberById(guild, interaction.member.user.id);
    let bukis = weapons.filter(function (value: $TSFixMe) {
      if (bukiType != null) {
        // 特定のbukiTypeが指定されているとき
        return bukiType === value.type.key;
      } else if (!~value.name.ja_JP.indexOf("ヒーロー")) {
        return true;
      }
    });
    let bukiNames = bukis.map(function (value: $TSFixMe) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: member.displayName + "のブキ",
          iconURL: member.displayAvatarURL(),
        })
        .setColor(0xf02d7d)
        .setTitle(value.name.ja_JP)
        .addFields({
          value: value.name.en_US,
          name: value.sub.name.ja_JP + " / " + value.special.name.ja_JP,
        });
      return embed;
    });

    if (amount) {
      var length = bukiNames.length;
      let embeds = [];
      for (let i = 0; i < amount; i++) {
        embeds.push(bukiNames[Math.floor(Math.random() * length)]);
      }
      await interaction.followUp({
        embeds: embeds,
      });
    } else {
      var buki = common.random(bukiNames, 1)[0];
      await interaction.followUp({ embeds: [buki] });
    }
  } catch (error) {
    await interaction.followUp("なんかエラーでてるわ");
    logger.error(error);
  }
}
