const { AttachmentBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const request = require('request');
const fs = require('fs');
const { parse } = require('csv');
const { stringify } = require('csv-stringify/sync');
const { createChannel } = require('../../manager/channelManager');
const { createRole, setColorToRole, searchRoleById, setRoleToMember } = require('../../manager/roleManager');
const log4js = require('log4js');

const INDEX_CATEGORY_ID = 0;
const INDEX_CATEGORY_NAME = 1;
const INDEX_CHANNEL_ID = 2;
const INDEX_CHANNEL_NAME = 3;
const INDEX_CHANNEL_TYPE = 4;
const INDEX_ROLE_ID = 5;
const INDEX_ROLE_NAME = 6;
const INDEX_COLOR_CODE = 7;
const INDEX_MEMBER_ID_START = 8;

log4js.configure('config/log4js-config.json');
const logger = log4js.getLogger('ChannelManager');

module.exports = async function handleCreateRoom(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;
    const attachment = options.getAttachment('csv');
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.editReply('チャンネルを管理する権限がないでし！');
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    if (!attachment.size) {
        return await interaction.editReply('CSVファイルを添付するでし！');
    }

    await interaction.editReply('作成中でし！\nこの作業には時間がかかるでし！');

    try {
        request(attachment.url).pipe(
            parse(async function (err, data) {
                // i = CSV行数
                // data[i][0] カテゴリID (カテゴリには権限がつかない)
                // data[i][1] カテゴリ名 (空の場合カテゴリなし)
                // data[i][2] チャンネルID
                // data[i][3] チャンネル名 (空の場合チャンネルなし & ロール紐付けなし)
                // data[i][4] チャンネルタイプ ('TEXT' or 'VOICE')
                // data[i][5] ロールID
                // data[i][6] ロール名 (空の場合ロールなし)
                // data[i][7] ロールカラーコード (空の場合ランダムでカラーコードを割り当て)
                // data[i][8...n] メンバーID

                if (data == undefined) {
                    return await interaction.followUp('CSVファイルがおかしいでし！\n要素数が全ての行で同じになっているか確認するでし！');
                }

                var resultData = [];

                const guild = await interaction.guild.fetch();

                resultData.push([
                    'カテゴリID',
                    'カテゴリ名',
                    'チャンネルID',
                    'チャンネル名',
                    'チャンネルタイプ',
                    'ロールID',
                    'ロール名',
                    'ロールカラー',
                ]);

                await interaction.editReply('0% 完了');

                var maxColumn = 0;

                for (var i = 1; i < data.length; i++) {
                    try {
                        var categoryName = data[i][INDEX_CATEGORY_NAME];
                        var channelName = data[i][INDEX_CHANNEL_NAME];
                        var channelType = data[i][INDEX_CHANNEL_TYPE];
                        var channelId = null;
                        var roleName = data[i][INDEX_ROLE_NAME];
                        var roleColor = data[i][INDEX_COLOR_CODE];

                        if (data[i].length > maxColumn) {
                            maxColumn = data[i].length;
                        }

                        if (categoryName != '') {
                            var categoryId = await createChannel(guild, null, categoryName, ChannelType.GuildCategory);
                        } else {
                            categoryId = null;
                        }

                        if (channelName != '') {
                            channelType = checkChannelType(channelType);

                            if (channelType !== '') {
                                if (channelType != 'ERROR!') {
                                    channelId = await createChannel(guild, categoryId, channelName, channelType);
                                }
                            }
                        } else {
                            channelType = checkChannelType(channelType);
                        }

                        var roleId = await createRole(guild, roleName);

                        if (roleId != null) {
                            await setRoleToChanel(guild, roleId, channelId);

                            var role = await searchRoleById(guild, roleId);

                            // the role will be displayed separately from other members
                            role.setHoist(true);

                            roleColor = await setRoleColor(guild, role, roleColor, i);
                        }

                        resultData.push([categoryId, categoryName, channelId, channelName, channelType, roleId, roleName, roleColor]);

                        if (roleId != null) {
                            for (let j = INDEX_MEMBER_ID_START; j < data[i].length; j++) {
                                var memberId = data[i][j].trim();
                                memberId = await setRoleToMember(guild, roleId, memberId);
                                resultData[i].push(memberId);
                            }
                        }

                        await interaction.editReply(parseInt((i / (data.length - 1)) * 100, 10) + '% 完了');
                    } catch (error) {
                        logger.error(error);
                        await interaction.followUp('データの' + i + '行目でエラーでし！');
                    }
                }

                for (var i = INDEX_MEMBER_ID_START; i < maxColumn; i++) {
                    resultData[0].push('メンバー' + (i - 7));
                }

                for (var i in resultData) {
                    for (var j = 0; j < maxColumn; j++) {
                        if (resultData[i][j] == null || resultData[i][j] == undefined) {
                            resultData[i][j] = '';
                        }
                    }
                }

                const csvString = stringify(resultData);
                fs.writeFileSync('./temp/temp.csv', csvString);
                const attachment = new AttachmentBuilder('./temp/temp.csv', 'output.csv');
                await interaction.editReply({
                    content: '終わったでし！下に結果を出すでし！',
                    files: [attachment],
                });

                const deleteCommandsText = setDeleteCommandsText(resultData);
                await interaction.followUp({
                    files: [deleteCommandsText],
                });
            }),
        );
    } catch (error) {
        await interaction.editReply('CSVファイル読み込み中にエラーでし！');
    }
};

function checkChannelType(channelType) {
    if (channelType == 'txt' || channelType == 'TEXT' || channelType == 'GUILD_TEXT') {
        return ChannelType.GuildText;
    } else if (channelType == 'vc' || channelType == 'VOICE' || channelType == 'GUILD_VOICE') {
        return ChannelType.GuildVoice;
    } else if (channelType == '') {
        return '';
    } else {
        return 'ERROR!';
    }
}

async function setRoleToChanel(guild, roleId, channelId, channelType) {
    // set permission to channel
    if (channelId != null && channelType != 'ERROR!') {
        const channel = await guild.channels.fetch(channelId);
        channel.permissionOverwrites.edit(roleId, {
            ViewChannel: true,
        });
        await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
            ViewChannel: false,
        });
    }
}

async function setRoleColor(guild, role, roleColor, index) {
    var originRoleColor = role.hexColor;
    var color;

    if (roleColor.match('^#([\\da-fA-F]{6})$')) {
        color = await setColorToRole(guild, role, roleColor);
    } else if (originRoleColor != '#000000') {
        color = originRoleColor;
    } else {
        var colorList = [
            '#E60012',
            '#EB6100',
            '#F39800',
            '#FCC800',
            '#FFF100',
            '#CFDB00',
            '#8FC31F',
            '#22AC38',
            '#009944',
            '#009B6B',
            '#009E96',
            '#00A0C1',
            '#00A0E9',
            '#0086D1',
            '#0068B7',
            '#00479D',
            '#1D2088',
            '#601986',
            '#920783',
            '#BE0081',
            '#E4007F',
            '#E5006A',
            '#E5004F',
            '#E60033',
        ];

        var colorIndex = index % 24;
        color = await setColorToRole(guild, role, colorList[colorIndex]);
    }

    return color;
}

function setDeleteCommandsText(resultData) {
    var resultCategoryIdList = [];
    var resultChannelIdList = [];
    var resultRoleIdList = [];
    for (var i = 1; i < resultData.length; i++) {
        if (resultData[i][0] != '' && resultData[i][0].match('\\d{18}')) {
            resultCategoryIdList.push(resultData[i][0]);
        }

        if (resultData[i][2] != '' && resultData[i][2].match('\\d{18}')) {
            resultChannelIdList.push(resultData[i][2]);
        }

        if (resultData[i][5] != '' && resultData[i][5].match('\\d{18}')) {
            resultRoleIdList.push(resultData[i][5]);
        }
    }
    resultCategoryIdList = Array.from(new Set(resultCategoryIdList));
    resultChannelIdList = Array.from(new Set(resultChannelIdList));
    resultRoleIdList = Array.from(new Set(resultRoleIdList));

    resultStr =
        '以下のコマンドを用いて今回作成したカテゴリ・チャンネル・ロールを全て削除することができます。\n' +
        '個別に削除する場合は出力されたCSVから削除したい項目を選んでコマンドで削除してください。\n\n' +
        'カテゴリ削除コマンド(※カテゴリ内のチャンネルも同時に削除されます。)\n' +
        '/ch_management カテゴリー削除';
    for (var categoryId of resultCategoryIdList) {
        resultStr = resultStr + ' ' + categoryId;
    }

    resultStr += '\n\nチャンネル削除コマンド\n/ch_management チャンネル削除';
    for (var channelId of resultChannelIdList) {
        resultStr = resultStr + ' ' + channelId;
    }

    fs.writeFileSync('./temp/temp.txt', resultStr);
    return new AttachmentBuilder('./temp/temp.txt', 'delete_commands.txt');
}
