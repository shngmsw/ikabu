const { AttachmentBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const request = require('request');
const fs = require('fs');
const { parse } = require('csv');
const { stringify } = require('csv-stringify/sync');
const { searchChannelById } = require('../../common/manager/channelManager');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('ChannelManager');

module.exports = async function handleDeleteCategory(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.followUp('チャンネルを管理する権限がないでし！');
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
        await interaction.editReply('CSVを読み込んで削除中でし！\nちょっと待つでし！');

        request(attachment.url).pipe(
            parse(async function (err, data) {
                try {
                    var categoryIdList = [];
                    for (var i in data) {
                        categoryIdList.push(data[i][0]);
                    }
                    categoryIdList = Array.from(new Set(categoryIdList));
                } catch (error) {
                    logger.error(error);
                    await interaction.followUp('CSVファイル読み込み中にエラーでし！');
                }
                deleteCategory(interaction, categoryIdList);
            }),
        );
    } else if (args.length != 0) {
        await interaction.editReply('指定されたIDのカテゴリを削除中でし！\nちょっと待つでし！');
        var categoryIdList = Array.from(new Set(args));
        deleteCategory(interaction, categoryIdList);
    } else {
        await interaction.followUp('CSVファイルを添付するか、削除したいカテゴリのIDを入れるでし！');
        return;
    }
};

async function deleteCategory(interaction, categoryIdList) {
    const guild = await interaction.guild.fetch();
    var removed = [];

    removed.push(['カテゴリID', 'カテゴリ名', 'チャンネルID', 'チャンネル名']);

    await interaction.editReply('0% 完了');

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
                var category = channelCollection.find((c) => c.id == categoryId && c.type == ChannelType.GuildCategory);
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
        logger.error(error);
        await interaction.followUp('カテゴリ削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new AttachmentBuilder('./temp/temp.csv', 'removed_category.csv');

    await interaction.followUp({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したチャンネルをまとめておいたでし！',
        files: [attachment],
    });
}

async function deleteChannelsByCategoryId(guild, categoryId) {
    let channels = [];
    let channelCollection = await guild.channels.fetch();
    while (channelCollection.find((c) => c.type != ChannelType.GuildCategory && c.parent == categoryId) != null) {
        var channel = channelCollection.find((c) => c.type != ChannelType.GuildCategory && c.parent == categoryId);
        if (channel.type == ChannelType.GuildText) {
            channels.push([channel.id, '#' + channel.name]);
        } else if (channel.type == ChannelType.GuildVoice) {
            channels.push([channel.id, '🔊' + channel.name]);
        }
        await channel.delete();
        channelCollection = await guild.channels.fetch();
    }
    return channels;
}
