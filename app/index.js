// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();
const Handler = require("./handler.js");
const Dispandar = require("./dispandar.js");
const TTS = require("./tts/voice_bot_node.js");
const privateChat = require("./secretchat.js");
const handleStageInfo = require("./stageinfo.js");
const removeRookie = require("./rookie.js");
const chatCountUp = require("./members.js");
const suggestionBox = require("./suggestion-box.js");
const join = require("./join.js");
client.login(process.env.DISCORD_BOT_TOKEN);

client.on("message", async (msg) => {
  if (msg.author.bot) {
    if (msg.content.startsWith("/poll")) {
      if (msg.author.username === "ブキチ") {
        console.log(msg.author.username);
        msg.delete();
      }
    }
    // ステージ情報
    if (msg.content === "stageinfo") {
      handleStageInfo(msg);
    }
    return;
  }
  if (msg.content.match("ボーリング")) {
    msg.channel.send(
      "```「ボウリング」とは、前方に正三角形に並べられた10本のピンと呼ばれる棒をめがけボールを転がし、倒れたピンの数によって得られる得点を競うスポーツでし。" +
      "専用施設のボウリング場に設置された細長いレーンの上で行われる屋内競技で、レーンの長さが約23m、ピンまでの距離は約18mで行われるのが一般的でし。" +
      "英語では “bowling” と書き、球を意味する “ball” ではなく、ラテン語で「泡」や「こぶ」を意味する “bowl” が語源とされているでし。" +
      "\n文部科学省は国語審議会で、球技を指す場合は「ボウリング」表記を用い、掘削を意味する「ボーリング」と区別することを推奨しているでし。```"
    );
  }

  Handler.call(msg);
  Dispandar.dispand(msg);
  TTS.main(msg);
  suggestionBox(msg).then((result) => {
    if (!result) {
      chatCountUp(msg);
      removeRookie(msg);
    }
  });

});

client.on("guildMemberAdd", (member) => {
  join(member);
});

client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
  guild.channels.cache
    .find((channel) => channel.id === "709400703751422074")
    .send(`${member.user.tag}さんが退部しました。`);
});

client.on("voiceStateUpdate", (oldState, newState) =>
  privateChat.onVoiceStateUpdate(oldState, newState)
);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
