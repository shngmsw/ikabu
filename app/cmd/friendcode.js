const insert = require('../../db/fc_insert.js');
const getFC = require('../../db/fc_select.js');
const Discord = require('discord.js');

module.exports = function handleFriendCode(msg) {
    if (msg.content.startsWith('fcadd')) {
        if (msg.channel.name === '自己紹介') {
            msg.delete();
            sendDM(msg);
        } else {
            insertFriendCode(msg);
        }
    } else if (msg.content.startsWith('fc')) {
        selectFriendCode(msg);
    }
};

async function selectFriendCode(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    // let id = args[0].replace('<@', '').replace('>','');

    // check if mention is included
    if (msg.mentions.members.size != 1) {
        msg.reply('フレンドコードを検索したい人のメンションを1つつけるでし');
        return;
    }

    let id = msg.mentions.users.first().id;
    let ch = await msg.guild.channels.cache.find((channel) => channel.name === '自己紹介');
    let messages = await ch.messages.fetch({ limit: 100 }).catch(console.error);
    let list = await messages.filter((m) => m.author.id === id);
    let result = list.map(function (value) {
        return value.content;
    });

    if (result.length == 0) {
        let fc = await getFC(id, msg, args[0]);
        // console.log("getFC:" + fc[0].code);
        if (fc[0] != null) {
            msg.channel.send({
                embeds: [composeEmbed(msg.mentions.users.first(), fc[0].code, true)],
            });
            return;
        }
    }
    if (result.length > 0) {
        for (var r of result) {
            msg.channel.send({
                embeds: [composeEmbed(msg.mentions.users.first(), r, false)],
            });
        }
    } else {
        msg.reply('自己紹介チャンネルに投稿がないか、投稿した日時が古すぎて検索できないでし');
    }
}

function composeEmbed(users, fc, isDatabase) {
    const embed = new Discord.MessageEmbed();
    embed.setDescription(fc);
    embed.setAuthor({ name: users.username, iconURL: users.displayAvatarURL() });
    if (!isDatabase) {
        embed.setFooter({
            text: '自己紹介チャンネルより引用',
        });
    }
    return embed;
}

async function insertFriendCode(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    // let id = args[0].replace('<@', '').replace('>','');
    let id = msg.author.id;
    let code = args[0];
    // console.log("handle_fc:" + id + "/" + code);
    insert(id, code);
    msg.reply('覚えたでし！');
}

async function sendDM(msg) {
    const introduction = msg.guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_INTRODUCTION);
    const botCmd = msg.guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_BOT_CMD);
    msg.author.createDM().then((DMChannel) => {
        // We have now a channel ready.
        // Send the message.
        DMChannel.send(
            `このメッセージは${introduction}チャンネルで\`fcadd\`コマンドを使った方に送信しています。 \n` +
                ` \`fcadd\`コマンドは${introduction} 以外のチャンネル(無難なのは ${botCmd} )で使用してください。 \n` +
                ` \`fc @自分\` と打つことで${introduction} の直近100件までに投稿された内容を表示することができます。\n` +
                `そのため、自己紹介以外の投稿があると検索対象の書き込みが減ってしまいます。ご協力お願いします。`,
        );
    });
}
