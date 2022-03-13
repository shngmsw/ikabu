const { MessageAttachment } = require('discord.js');
const request = require('request');
const fs = require('fs');
const { parse } = require('csv');
const { stringify } = require('csv-stringify/sync');
const { searchChannelById } = require('../../manager/channelManager.js');

module.exports = function handleDeleteCategory(msg) {
    if (!msg.member.permissions.has('MANAGE_CHANNELS')) {
        return msg.reply('チャンネルを管理する権限がないでし！');
    }

    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = strCmd.replace('\x20+', ' ');
    const splits = strCmd.split(' ');
    splits.shift();
    var args = [];
    for (var argument of splits) {
        if (argument != '') {
            args.push(argument);
        }
    }

    if (msg.attachments.size) {
        msg.channel.send('CSVを読み込んで削除中でし！\nちょっと待つでし！');

        const files = msg.attachments.map((attachment) => attachment.url);

        request(files[0]).pipe(
            parse(async function (err, data) {
                try {
                    var categoryIdList = [];
                    for (var i in data) {
                        categoryIdList.push(data[i][0]);
                    }
                    categoryIdList = Array.from(new Set(categoryIdList));
                } catch (error) {
                    console.error(error);
                    msg.reply('CSVファイル読み込み中にエラーでし！');
                }
                deleteCategory(msg, categoryIdList);
            }),
        );
    } else if (args.length != 0) {
        msg.channel.send('指定されたIDのカテゴリを削除中でし！\nちょっと待つでし！');
        var categoryIdList = Array.from(new Set(args));
        deleteCategory(msg, categoryIdList);
    } else {
        msg.reply('CSVファイルを添付するか、削除したいカテゴリのIDを入れるでし！');
        return;
    }
};

async function deleteCategory(msg, categoryIdList) {
    const guild = msg.guild;
    var removed = [];

    removed.push(['カテゴリID', 'カテゴリ名', 'チャンネルID', 'チャンネル名']);

    const progressMsg = await msg.channel.send('0% 完了');

    try {
        // i = index
        // removed[i][0] = deleted category (name)
        // removed[i][1][0...n] = deleted channel (name)
        for (var i in categoryIdList) {
            var categoryId = categoryIdList[i];
            var categoryName;
            // if category ID is not found or the ID type is not a category, consider as an error.
            if (searchChannelById(guild, categoryId) == null) {
                categoryName = 'NOT_FOUND!';
                removed.push([categoryId, 'NOT_FOUND!', '', '']);
            } else {
                var channels = await deleteChannelsByCategoryId(guild, categoryId);
                var category = guild.channels.cache.find((c) => c.id == categoryId && c.type == 'GUILD_CATEGORY');
                categoryName = category.name;
                await category.delete();
                await guild.channels.fetch();
                if (channels.length == 0) {
                    removed.push([categoryId, categoryName, '', '']);
                } else {
                    for (var channel of channels) {
                        removed.push([categoryId, categoryName, channel[0], channel[1]]);
                    }
                }
            }
            await progressMsg.edit(parseInt(((+i + 1) / categoryIdList.length) * 100, 10) + '% 完了');
        }
    } catch (error) {
        console.error(error);
        msg.reply('カテゴリ削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new MessageAttachment('./temp/temp.csv', 'removed_category.csv');

    msg.reply({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したチャンネルをまとめておいたでし！',
        files: [attachment],
    });
}

async function deleteChannelsByCategoryId(guild, categoryId) {
    var channels = [];
    while (guild.channels.cache.find((c) => c.type != 'GUILD_CATEGORY' && c.parent == categoryId) != null) {
        var channel = guild.channels.cache.find((c) => c.type != 'GUILD_CATEGORY' && c.parent == categoryId);
        if (channel.type == 'GUILD_TEXT') {
            channels.push([channel.id, '#' + channel.name]);
        } else if (channel.type == 'GUILD_VOICE') {
            channels.push([channel.id, '🔊' + channel.name]);
        }
        await channel.delete();
        await guild.channels.fetch();
    }
    return channels;
}
