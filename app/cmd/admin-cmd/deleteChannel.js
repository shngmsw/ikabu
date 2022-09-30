const { MessageAttachment } = require('discord.js');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const { searchChannelById } = require('../../manager/channelManager');

module.exports = async function handleDeleteChannel(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        return await interaction.followUp('チャンネルを管理する権限がないでし！');
    }
    const { options } = interaction;
    const categoryIds = options.getString('チャンネルid');

    let strCmd = categoryIds.replace('\x20+', ' ');
    const splits = strCmd.split(' ');
    var channelIdList = [];
    for (var argument of splits) {
        if (argument != '') {
            channelIdList.push(argument);
        }
    }

    if (channelIdList.length == 0) {
        return await interaction.followUp('削除したいチャンネルのIDを入れるでし！');
    }

    await interaction.editReply('指定されたIDのチャンネルを削除中でし！\nちょっと待つでし！');

    const guild = await interaction.guild.fetch();
    var removed = [];

    removed.push(['チャンネルID', 'チャンネル名']);

    await interaction.editReply('0% 完了');

    channelIdList = Array.from(new Set(channelIdList));

    try {
        // i = index
        // removed[i][0] = deleted channel (id)
        // removed[i][1] = deleted channel (name)
        for (var i in channelIdList) {
            var channelName;
            var channel = await searchChannelById(guild, channelIdList[i]);
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

            await interaction.editReply(parseInt(((+i + 1) / channelIdList.length) * 100, 10) + '% 完了');
        }
    } catch (error) {
        console.error(error);
        await interaction.followUp('チャンネル削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new MessageAttachment('./temp/temp.csv', 'removed_channel.csv');

    await interaction.followUp({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したチャンネルをまとめておいたでし！',
        files: [attachment],
    });
};
