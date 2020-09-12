const insert = require("../db/fc_insert.js");
const getFC = require("../db/fc_select.js");

module.exports = function handleFriendCode(msg) {
    if (msg.content.startsWith("fcadd")) {
        insertFriendCode(msg);
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
    let ch = await msg.guild.channels.find("name", "自己紹介");
    let messages = await ch.fetchMessages({ limit: 100 }).catch(console.error);
    let list = await messages.filter(m => m.author.id === id);
    let result = list.map(function (value) {
        return value.content;
    });

    if (result.length == 0) {
        let fc = await getFC(id, msg, args[0]);
        console.log("getFC:" + fc[0].code);
        if (fc[0] != null) {
            msg.channel.send("", {
                embed: {
                    author: {
                        name: msg.mentions.users.first().username + "のフレコ",
                        icon_url: msg.mentions.users.first().avatarURL
                    },
                    color: 0xf02d7d,
                    title: fc[0].code
                }
            });
            return;
        }
    }
    if (result.length > 0) {
        for (var r of result) {
            msg.channel.send("", {
                embed: {
                    author: {
                        name: msg.mentions.users.first().username + "のフレコ",
                        icon_url: msg.mentions.users.first().avatarURL
                    },
                    color: 0xf02d7d,
                    fields: [
                        {
                            name: "自己紹介チャンネルより引用",
                            value: r
                        }
                    ]
                }
            });
        }
    } else {
        msg.channel.send(
            "自己紹介チャンネルに投稿がないか、投稿した日時が古すぎて検索できないでし"
        );
    }
}

async function insertFriendCode(msg) {
    var strCmd = msg.content.replace(/　/g, " ");
    const args = strCmd.split(" ");
    args.shift();
    // let id = args[0].replace('<@', '').replace('>','');
    let id = msg.author.id;
    let code = args[0];
    console.log("handle_fc:" + id + "/" + code);
    insert(id, code);
    msg.channel.send("覚えたでし！");
}