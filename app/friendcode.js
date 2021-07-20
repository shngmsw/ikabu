const insert = require("../db/fc_insert.js");
const getFC = require("../db/fc_select.js");
const Discord = require("discord.js");

module.exports = function handleFriendCode(msg) {
    if (msg.content.startsWith("fcadd")) {
        if (msg.channel.name === "自己紹介") {
            msg.delete();
            sendDM(msg);
        } else {
            insertFriendCode(msg);
        }
    } else if (msg.content.startsWith("fc")) {
        selectFriendCode(msg);
    }
}

async function selectFriendCode(msg) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    // let id = args[0].replace('<@', '').replace('>','');
    let id = msg.mentions.users.first().id;
    let ch = await msg.guild.channels.cache.find(channel => channel.name === "自己紹介");
    let messages = await ch.messages.fetch({ limit: 100 }).catch(console.error);
    let list = await messages.filter(m => m.author.id === id);
    let result = list.map(function (value) {
        return value.content;
    });

    if (result.length == 0) {
        let fc = await getFC(id, msg, args[0]);
        // console.log("getFC:" + fc[0].code);
        if (fc[0] != null) {
            msg.channel.send(composeEmbed(msg.mentions.users.first(), fc[0].code, true));
            return;
        }
    }
    if (result.length > 0) {
        for (var r of result) {
            msg.channel.send(composeEmbed(msg.mentions.users.first(), r, false));
        }
    } else {
        msg.channel.send(
            "自己紹介チャンネルに投稿がないか、投稿した日時が古すぎて検索できないでし"
        );
    }
}

function composeEmbed(users, fc, isDatabase) {
    const embed = new Discord.MessageEmbed();
    embed.setDescription(fc);
    embed.setAuthor(
        name = users.username,
        iconURL = users.avatarURL()
    );
    if (!isDatabase) {
        embed.setFooter(
            text = "自己紹介チャンネルより引用"
        );
    }
    return embed;
}

async function insertFriendCode(msg) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    // let id = args[0].replace('<@', '').replace('>','');
    let id = msg.author.id;
    let code = args[0];
    // console.log("handle_fc:" + id + "/" + code);
    insert(id, code);
    msg.channel.send("覚えたでし！");
}

async function sendDM(msg) {
    const introduction = msg.guild.channels.cache.find(channel => channel.id === "417591840250920971");
    const botCmd = msg.guild.channels.cache.find(channel => channel.id === "465031112318517248");
    msg.author.createDM().then(DMChannel => {
        // We have now a channel ready.
        // Send the message.
        DMChannel.send(
            `\`fcadd\`は ${introduction} 以外のチャンネル(無難なのは ${botCmd} )で使用してください。 \n`
            + `${introduction} の直近100件までに投稿された内容は \`fc @自分\` で表示することができます。\n`
            + `${introduction} でコマンド \`fcadd\` を使用すると、検索対象の書き込みが減ってしまいます。ご協力お願いします。`
        );
    });

}