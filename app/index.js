// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const Handler = require("./handler.js");

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("message", async msg => {
  if (msg.author.bot) {
    if (msg.content.startsWith("/poll")) {
      if (msg.author.username === "ブキチ") {
        console.log(msg.author.username);
        msg.delete();
      }
    }
    // ステージ情報
    if (msg.content === "stageinfo") {
      Handler.call(msg);
      msg.delete();
    }
    return;
  }
  Handler.call(msg);
});

client.on("guildMemberAdd", member => {
  const guild = member.guild;
  guild.channels
    .find("id", "414095683746922517")
    .send(
      `<@!${
        member.user.id
      }> たん、よろしくお願いします！\nまずは ${guild.channels.find(
        "id",
        "477067128479023115"
      )} と ${guild.channels.find(
        "id",
        "477067552015515658"
      )} をよく読んでから ${guild.channels.find(
        "id",
        "417591840250920971"
      )} で自己紹介も兼ねて自分のフレコを貼ってください\n\n${
        guild.name
      }のみんなが歓迎していますよ〜`
    )
    .then(sentMessage => sentMessage.react("👍"));
});

client.on("guildMemberRemove", member => {
  const guild = member.guild;
  guild.channels
    .find("id", "451272874268033034")
    .send(`${member}さんが退部しました。`);
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
