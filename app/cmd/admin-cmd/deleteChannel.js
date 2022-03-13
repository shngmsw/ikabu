const { MessageAttachment } = require('discord.js');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const { searchChannelById } = require('../../manager/channelManager.js');

module.exports = async function handleDeleteChannel(msg) {
    if (!msg.member.permissions.has('MANAGE_CHANNELS')) {
        return msg.reply('チャンネルを管理する権限がないでし！');
    }

    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = strCmd.replace('\x20+', ' ');
    const splits = strCmd.split(' ');
    splits.shift();
    var channelIdList = [];
    for (var argument of splits) {
        if (argument != '') {
            channelIdList.push(argument);
        }
    }

    if (channelIdList.length == 0) {
        return msg.reply('削除したいチャンネルのIDを入れるでし！');
    }

    msg.channel.send('指定されたIDのチャンネルを削除中でし！\nちょっと待つでし！');

    const guild = msg.guild;
    var removed = [];

    removed.push(['チャンネルID', 'チャンネル名']);

    const progressMsg = await msg.channel.send('0% 完了');

    channelIdList = Array.from(new Set(channelIdList));

    try {
        // i = index
        // removed[i][0] = deleted channel (id)
        // removed[i][1] = deleted channel (name)
        for (var i in channelIdList) {
            var channelName;
            var channel = searchChannelById(guild, channelIdList[i], null);
            // if channel ID is not found, consider as an error.
            if (channel == null) {
                channelName = 'NOT_FOUND!';
            } else if (channel.type == 'GUILD_CATEGORY') {
                channelName = 'THIS_IS_CATEGORY';
            } else {
                if (channel.type == 'GUILD_TEXT') {
                    channelName = '#' + channel.name;
                } else if (channel.type == 'GUILD_VOICE') {
                    channelName = '🔊' + channel.name;
                }
                await channel.delete();
                await guild.channels.fetch();
            }
            removed.push([channelIdList[i], channelName]);

            await progressMsg.edit(parseInt(((+i + 1) / channelIdList.length) * 100, 10) + '% 完了');
        }
    } catch (error) {
        console.error(error);
        msg.reply('チャンネル削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new MessageAttachment('./temp/temp.csv', 'removed_channel.csv');

    msg.reply({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したチャンネルをまとめておいたでし！',
        files: [attachment],
    });
};
