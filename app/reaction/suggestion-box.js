const BOT_ROLE_NAME = "BOT";
const common = require("../common.js");
const suggestionChannelParentId = process.env.CATEGORY_PARENT_ID_SUGGESTION_BOX;
const infomationChannelId = process.env.CHANNEL_ID_INFOMATION;
const Discord = require("discord.js");

module.exports = {
  init: async function suggestionBox(msg, user) {
    if (
      msg.member.permissions.has("ADMINISTRATOR") &&
      suggestionChannelParentId == msg.channel.parent.id &&
      msg.content === "!init"
    ) {
      let messgeEmbed = new Discord.MessageEmbed()
        .setTitle("ご意見や通報、お問い合わせについて")
        .setColor(0x008080)
        .setDescription(
          "イカ部に関するご意見や、メンバーからの嫌がらせなどを通報するにはこのメッセージに📭リアクションをしてください。\n" +
          "あなたと管理者だけしか閲覧できないプライベートチャンネルが作成されます。\n" +
          "頂いたご意見、通報内容の全てに対応できる訳ではございませんので、ご了承くださいませ。" +
          `ご意見の一部は <#${infomationChannelId}> にて回答させて頂く場合がございます。`
        );
      msg.channel
        .send({ embeds: [messgeEmbed] })
        .then((sentMessage) => sentMessage.react("📭"));
      msg.delete();
    }
  },
  create: async function suggestionBox(msg, user) {
    const newChannel = await txChCreate(msg, user);
    newChannel.send({
      content:
        "@everyone " +
        `<@${user.id}>` +
        "さん専用のチャンネルでし\n問い合わせ内容を入力してほしいでし\n`(管理者のみ)!close`で問い合わせを終了してアーカイブできるでし"
    }
    );
    return;
  },
  archive: async function suggestionBoxArchive(msg) {
    if (
      msg.member.permissions.has("ADMINISTRATOR") &&
      suggestionChannelParentId == msg.channel.parent.id &&
      msg.content === "!close"
    ) {
      msg.delete();
      let messages = await msg.channel.messages
        .fetch({ limit: 100 })
        .catch(console.error);
      messages.sort(function (a, b) {
        if (a.createdTimestamp < b.createdTimestamp) return -1;
        if (a.createdTimestamp > b.createdTimestamp) return 1;
        return 0;
      });
      const guild = msg.guild;
      const sendChannel = await guild.channels.cache.find(
        (channel) =>
          channel.id === process.env.CHANNEL_ID_SUGGESTION_BOX_ARCHIVE
      );
      let url = await m.url();
      messages.map((m) => sendChannel.send({ embeds: [common.composeEmbed(m, url)] }));
      txChHide(msg);
      return;
    }
  },
};

async function txChCreate(msg, user) {
  try {
    const guild = msg.channel.guild;
    const msgChannel = msg.channel;
    let chName = (await msg.createdTimestamp) + "-" + user.username;
    let botRole = await guild.roles.cache.find(
      (val) => val.name === BOT_ROLE_NAME
    );
    let result = await guild.channels.create(chName, {
      parent: msgChannel.parent,
      type: "text",
      topic: '"!close"でアーカイブ',
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ["VIEW_CHANNEL"],
        },
        {
          id: user.id,
          allow: ["VIEW_CHANNEL"],
        },
        {
          id: botRole.id,
          allow: ["VIEW_CHANNEL"],
        },
      ],
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function txChHide(msg) {
  let members = msg.channel.members;
  if (members != null) {
    members.map((member) =>
      msg.channel.updateOverwrite(member.id, { VIEW_CHANNEL: false })
    );
    msg.channel.send("アーカイブ完了しました。");
  } else {
    console.log("チャンネルがないンゴ");
  }
}
