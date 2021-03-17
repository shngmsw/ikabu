const BOT_ROLE_NAME = "bot";
const common = require("./common.js");

module.exports = async function suggestionBox(msg) {
    const guild = msg.guild;
    const suggestionChannel = await guild.channels.cache.find(
        (channel) => channel.name === "ご意見や通報などはこちら"
    );

    if (msg.channel.name === suggestionChannel.name) {
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
            const msgContent = msg.content;
            const newChannel = await txChCreate(msg);
            newChannel.send("@everyone " + `<@${msg.author.id}>` +"さんからご意見箱に投稿があったでし");
            newChannel.send("```" + msg.content + "```");
            msg.delete();
            return true;
        }
    } else if (msg.member.hasPermission("ADMINISTRATOR")
        && suggestionChannel.parent == msg.channel.parent
        && msg.content === "!close") {
        const sendChannel = await guild.channels.cache.find(
            (channel) => channel.name === "ご意見箱"
        );
        msg.delete();

        let messages = await msg.channel.messages.fetch({ limit: 100 }).catch(console.error);
        messages.sort(function (a, b) {
            if (a.createdTimestamp < b.createdTimestamp) return -1;
            if (a.createdTimestamp > b.createdTimestamp) return 1;
            return 0;
        });

        messages.map(
            m => sendChannel.send(common.composeEmbed(m))
        );
        txChHide(msg);
        return true;
    }
    return false;
}

async function txChCreate(msg) {
    try {
        const guild = msg.channel.guild;
        const msgChannel = msg.channel;
        let chName = await msg.createdTimestamp + "-" + msg.author.username;
        let botRole = await guild.roles.cache.find(val => val.name === BOT_ROLE_NAME);
        let result = await guild.channels.create(chName, {
            parent: msgChannel.parent,
            type: "text",
            topic: '"!close"でアーカイブ',
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: msg.author.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: botRole.id,
                    allow: ["VIEW_CHANNEL"]
                }
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
        members.map(member =>
            msg.channel.updateOverwrite(member.id, { VIEW_CHANNEL: false })
        );
        msg.channel.send("アーカイブ完了しました。")
    } else {
        console.log("チャンネルがないンゴ");
    }
}