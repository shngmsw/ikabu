import fs from 'fs';

import { parse } from 'csv';
import { stringify } from 'csv-stringify/sync';
import { AttachmentBuilder, ChannelType, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import request from 'request';

import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { exists, notExists } from '../../common/others';

const logger = log4js_obj.getLogger('ChannelManager');

export async function handleDeleteCategory(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.followUp('チャンネルを管理する権限がないでし！');
    }

    const { options } = interaction;
    const attachment = options.getAttachment('csv');
    const categoryIds = options.getString('カテゴリーid');
    const args = [];
    if (exists(categoryIds)) {
        const strCmd = categoryIds.replace('\x20+', ' ');
        const splits = strCmd.split(' ');
        for (const argument of splits) {
            if (argument != '') {
                args.push(argument);
            }
        }
    }

    if (exists(attachment) && attachment.size) {
        await interaction.editReply('CSVを読み込んで削除中でし！\nちょっと待つでし！');

        request(attachment.url).pipe(
            parse(async function (err: $TSFixMe, data: $TSFixMe) {
                let categoryIdList = [];
                try {
                    for (const i in data) {
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
        const categoryIdList = Array.from(new Set(args));
        deleteCategory(interaction, categoryIdList);
    } else {
        await interaction.followUp('CSVファイルを添付するか、削除したいカテゴリのIDを入れるでし！');
        return;
    }
}

async function deleteCategory(interaction: $TSFixMe, categoryIdList: $TSFixMe) {
    const guild = await interaction.guild.fetch();
    const removed = [];

    removed.push(['カテゴリID', 'カテゴリ名', 'チャンネルID', 'チャンネル名']);

    await interaction.editReply('0% 完了');

    try {
        // i = index
        // removed[i][0] = deleted category (name)
        // removed[i][1][0...n] = deleted channel (name)
        for (const i in categoryIdList) {
            const categoryId = categoryIdList[i];
            let categoryName;
            // if category ID is not found or the ID type is not a category, consider as an error.
            if (notExists(await searchChannelById(guild, categoryId))) {
                categoryName = 'NOT_FOUND!';
                removed.push([categoryId, 'NOT_FOUND!', '', '']);
            } else {
                const channels = await deleteChannelsByCategoryId(guild, categoryId);
                const channelCollection = await guild.channels.fetch();
                const category = channelCollection.find((c: $TSFixMe) => c.id == categoryId && c.type == ChannelType.GuildCategory);
                categoryName = category.name;
                await category.delete();
                await guild.channels.fetch();
                if (channels.length == 0) {
                    removed.push([categoryId, categoryName, '', '']);
                } else {
                    for (const channel of channels) {
                        removed.push([categoryId, categoryName, channel[0], channel[1]]);
                    }
                }
            }
            const progress = `${((+i + 1) / categoryIdList.length) * 100}`;
            await interaction.editReply(parseInt(progress, 10) + '% 完了');
        }
    } catch (error) {
        logger.error(error);
        await interaction.followUp('カテゴリ削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new AttachmentBuilder('./temp/temp.csv', {
        name: 'removed_category.csv',
    });

    await interaction.followUp({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したチャンネルをまとめておいたでし！',
        files: [attachment],
    });
}

async function deleteChannelsByCategoryId(guild: $TSFixMe, categoryId: $TSFixMe) {
    const channels = [];
    let channelCollection = await guild.channels.fetch();
    while (exists(channelCollection.find((c: $TSFixMe) => c.type != ChannelType.GuildCategory && c.parent == categoryId))) {
        const channel = channelCollection.find((c: $TSFixMe) => c.type != ChannelType.GuildCategory && c.parent == categoryId);
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
