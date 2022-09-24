const { MessageAttachment } = require('discord.js');
const request = require('request');
const fs = require('fs');
const { parse } = require('csv');
const { stringify } = require('csv-stringify/sync');
const app = require('app-root-path').resolve('app');
const { searchChannelById } = require(app + '/manager/channelManager.js');

module.exports = async function handleDeleteCategory(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        return interaction.followUp('チャンネルを管理する権限がないでし！');
    }

    const { options } = interaction;
    const attachment = options.getAttachment('csv');
    const categoryIds = options.getString('カテゴリーid');
    var args = [];
    if (categoryIds != null) {
        let strCmd = categoryIds.replace('\x20+', ' ');
        const splits = strCmd.split(' ');
        for (var argument of splits) {
            if (argument != '') {
                args.push(argument);
            }
        }
    }

    if (attachment != null && attachment.size) {
        interaction.editReply('CSVを読み込んで削除中でし！\nちょっと待つでし！');

        request(attachment.url).pipe(
            parse(async function (err, data) {
                try {
                    var categoryIdList = [];
                    for (var i in data) {
                        categoryIdList.push(data[i][0]);
                    }
                    categoryIdList = Array.from(new Set(categoryIdList));
                } catch (error) {
                    console.error(error);
                    interaction.followUp('CSVファイル読み込み中にエラーでし！');
                }
                deleteCategory(interaction, categoryIdList);
            }),
        );
    } else if (args.length != 0) {
        interaction.editReply('指定されたIDのカテゴリを削除中でし！\nちょっと待つでし！');
        var categoryIdList = Array.from(new Set(args));
        deleteCategory(interaction, categoryIdList);
    } else {
        interaction.followUp('CSVファイルを添付するか、削除したいカテゴリのIDを入れるでし！');
        return;
    }
};

async function deleteCategory(interaction, categoryIdList) {
    const guild = interaction.guild;
    var removed = [];

    removed.push(['カテゴリID', 'カテゴリ名', 'チャンネルID', 'チャンネル名']);

    await interaction.followUp('0% 完了');

    try {
        // i = index
        // removed[i][0] = deleted category (name)
        // removed[i][1][0...n] = deleted channel (name)
        for (var i in categoryIdList) {
            var categoryId = categoryIdList[i];
            var categoryName;
            // if category ID is not found or the ID type is not a category, consider as an error.
            if ((await searchChannelById(guild, categoryId)) == null) {
                categoryName = 'NOT_FOUND!';
                removed.push([categoryId, 'NOT_FOUND!', '', '']);
            } else {
                var channels = await deleteChannelsByCategoryId(guild, categoryId);
                const channelCollection = await guild.channels.fetch();
                var category = channelCollection.find((c) => c.id == categoryId && c.type == 'GUILD_CATEGORY');
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
            await interaction.editReply(parseInt(((+i + 1) / categoryIdList.length) * 100, 10) + '% 完了');
        }
    } catch (error) {
        console.error(error);
        interaction.followUp('カテゴリ削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new MessageAttachment('./temp/temp.csv', 'removed_category.csv');

    interaction.followUp({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したチャンネルをまとめておいたでし！',
        files: [attachment],
    });
}

async function deleteChannelsByCategoryId(guild, categoryId) {
    var channels = [];
    const channelCollection = await guild.channels.fetch();
    while (channelCollection.find((c) => c.type != 'GUILD_CATEGORY' && c.parent == categoryId) != null) {
        var channel = channelCollection.find((c) => c.type != 'GUILD_CATEGORY' && c.parent == categoryId);
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
