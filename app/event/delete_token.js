const Discord = require("discord.js");
const { Message } = require("discord.js");

module.exports = function deleteToken(msg) {
  if (
    msg.content.match(
      "[a-zA-Z0-9_-]{23,28}\\.[a-zA-Z0-9_-]{6,7}\\.[a-zA-Z0-9_-]{27}"
    )
  ) {
    msg.delete({ reason: "tokenの入った文字列を削除" });

    msg.guild.channels.cache
      .find((channel) => channel.name === "精神とテクの部屋")
      .send(`token検出 (author: <@${msg.author.id}>)`);
  }
};
