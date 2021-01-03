const Discord = require("discord.js");

module.exports = function removeRookie(msg) {
  const dt = new Date();
  const lastMonth = dt.setMonth(dt.getMonth() + 1);
  const beginnerRole = msg.guild.roles.cache.find(
    (role) => role.name === "🔰新入部員"
  );
  if (msg.member.joinedTimestamp < lastMonth) {
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
