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
const getMember = require("../db/members_select.js");
const getFC = require("../db/fc_select.js");
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
  //TTS.main(msg);
//  removeRookie(msg);
//  chatCountUp(msg);
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  const roby = guild.channels.cache.find(
    (channel) => channel.id === "414095683746922517"
  );
  const rules = guild.channels.cache.find(
    (channel) => channel.id === "477067128479023115"
  );
  const channelDiscription = guild.channels.cache.find(
    (channel) => channel.id === "477067552015515658"
  );
  const introduction = guild.channels.cache.find(
    (channel) => channel.id === "417591840250920971"
  );
  const beginnerRole = guild.roles.cache.find(
    (role) => role.name === "🔰新入部員"
  );
  const messageCount = getMessageCount(member.id);
  const friendCode = getFriendCode(member.id);
  console.log(messageCount);
  console.log(friendCode);
  if (beginnerRole) {
    if (messageCount > 0 || friendCode != null) {
      member.roles.set([beginnerRole.id]).then(console.log).catch(console.error);
    }
  }

  // guild.channels.cache
  //   .find((channel) => channel.id === "414095683746922517")
  //   .send(
  //     `<@!${member.user.id}> たん、よろしくお願いします！\n` +
  //     `最初の10分間は閲覧しかできません、その間に ${rules} と ${channelDiscription} をよく読んでくださいね\n` +
  //     `10分経ったら、書き込めるようになります。 ${introduction} で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
  //     `${guild.name}のみんなが歓迎していますよ〜`
  //   )
  //   .then((sentMessage) => sentMessage.react("👍"));
});

// client.on("guildMemberRemove", (member) => {
//   const guild = member.guild;
//   guild.channels.cache
//     .find((channel) => channel.id === "709400703751422074")
//     .send(`${member.user.tag}さんが退部しました。`);
// });

client.on("voiceStateUpdate", (oldState, newState) =>
  privateChat.onVoiceStateUpdate(oldState, newState)
);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

async function getMessageCount(id) {
  const result = await getMember(id);
  if (result != null) {
    return result[0].message_count;
  }
  result = null;
}

async function getFriendCode(id) {
  return await getFC(id);
}