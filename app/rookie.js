const Discord = require("discord.js");
const getMember = require("../db/members_select.js");
module.exports = async function removeRookie(msg) {
  const dt = new Date();
  const lastMonth = dt.setMonth(dt.getMonth() - 1);
  const beginnerRole = msg.guild.roles.cache.find(
    (role) => role.name === "🔰新入部員"
  );
  const messageCount = await getMessageCount(msg.member.id);
  if (msg.member.joinedTimestamp < lastMonth
    || messageCount > 99) {
    const hasBeginnerRole = msg.member.roles.cache.find(
      (role) => role.id === beginnerRole.id
    );
    if (hasBeginnerRole) {
      msg.member.roles.remove([beginnerRole.id]);
      const embed = new Discord.MessageEmbed();
      embed.setDescription(
        "新入部員期間が終わったでし！\nこれからもイカ部心得を守ってイカ部生活をエンジョイするでし！"
      );
      embed.setAuthor(
        (name = msg.author.username),
        (iconURL = msg.author.avatarURL())
      );
      msg.channel.send(embed);
    }
  }
};

async function getMessageCount(id) {
  const result = await getMember(id);
  if (result[0] != null) {
      return result[0].message_count;
  }
  return 0;
}
