const { MessageAttachment } = require('discord.js');
const request = require('request');
const fs = require('fs');
const { parse } = require('csv');
const { stringify } = require('csv-stringify/sync');
const { createChannel } = require('../../manager/channelManager.js');
const { createRole, setColorToRole, searchRoleById, setRoleToMember } = require('../../manager/roleManager.js');

module.exports = function handleCreateRoom(msg) {
    if (!msg.member.permissions.has('MANAGE_CHANNELS')) {
        return msg.reply('チャンネルを管理する権限がないでし！');
    }

    if (!msg.member.permissions.has('MANAGE_ROLES')) {
        return msg.reply('ロールを管理する権限がないでし！');
    }

    if (!msg.attachments.size) {
        return msg.reply('CSVファイルを添付するでし！');
    }

    msg.channel.send('作成中でし！\nこの作業には時間がかかるでし！');

    const files = msg.attachments.map((attachment) => attachment.url);

    try {
        request(files[0]).pipe(
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
                    return msg.reply('CSVファイルがおかしいでし！\n要素数が全ての行で同じになっているか確認するでし！');
                }

                var resultData = [];

                var guild = msg.guild;

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

                const progressMsg = await msg.channel.send('0% 完了');

                var maxColumn = 0;

                for (var i = 1; i < data.length; i++) {
                    try {
                        var categoryName = data[i][1];
                        var channelName = data[i][3];
                        var channelType = data[i][4];
                        var channelId;
                        var roleName = data[i][6];
                        var roleColor = data[i][7];

                        if (data[i].length > maxColumn) {
                            maxColumn = data[i].length;
                        }

                        if (categoryName != '') {
                            var categoryId = await createChannel(guild, null, categoryName, 'GUILD_CATEGORY');
                        } else {
                            categoryId = null;
                        }

                        if (channelName != '') {
                            channelType = checkChannelType(channelType);

                            if (channelType != '') {
                                if (channelType != 'ERROR!') {
                                    channelId = await createChannel(guild, categoryId, channelName, channelType);
                                }
                            } else {
                                channelId = null;
                            }
                        } else {
                            channelId = null;
                            channelType = checkChannelType(channelType);
                        }

                        var roleId = await createRole(guild, roleName);

                        if (roleId != null) {
                            // set permission to channel
                            if (channelId != null && channelId != 'ERROR!') {
                                guild.channels.cache.get(channelId).permissionOverwrites.edit(roleId, {
                                    VIEW_CHANNEL: true,
                                });
                                guild.channels.cache.get(channelId).permissionOverwrites.edit(guild.roles.everyone.id, {
                                    VIEW_CHANNEL: false,
                                });
                            }

                            var role = searchRoleById(guild, roleId);

                            // the role will be displayed separately from other members
                            role.setHoist(true);
                            var originRoleColor = role.hexColor;

                            if (roleColor.match('^#([\\da-fA-F]{6})$')) {
                                roleColor = await setColorToRole(guild, role, roleColor);
                            } else if (originRoleColor != '#000000') {
                                roleColor = originRoleColor;
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

                                var colorIndex = i % 24;
                                roleColor = await setColorToRole(guild, role, colorList[colorIndex]);
                            }
                        }

                        resultData.push([categoryId, categoryName, channelId, channelName, channelType, roleId, roleName, roleColor]);

                        if (roleId != null) {
                            for (let j = 8; j < data[i].length; j++) {
                                var memberId = data[i][j].trim();
                                memberId = setRoleToMember(guild, roleId, memberId);
                                resultData[i].push(memberId);
                            }
                        }

                        await progressMsg.edit(parseInt((i / (data.length - 1)) * 100, 10) + '% 完了');
                    } catch (error) {
                        console.error(error);
                        msg.channel.send('データの' + i + '行目でエラーでし！');
                    }
                }

                for (var i = 8; i < maxColumn; i++) {
                    resultData[0].push('メンバー' + (i - 7));
                }

                for (var i in resultData) {
                    for (var j = 0; j < maxColumn; j++) {
                        if (resultData[i][j] == null || resultData[i][j] == undefined) {
                            resultData[i][j] = '';
                        }
                    }
                }

                console.log(resultData);

                const csvString = stringify(resultData);
                console.log(csvString);
                fs.writeFileSync('./temp/temp.csv', csvString);
                const attachment = new MessageAttachment('./temp/temp.csv', 'output.csv');
                msg.reply({
                    content: '終わったでし！下に結果を出すでし！',
                    files: [attachment],
                });

                const deleteCommands = createDeleteCommands(resultData);
                msg.channel.send({
                    files: [deleteCommands],
                });
            }),
        );
    } catch (error) {
        msg.reply('CSVファイル読み込み中にエラーでし！');
    }
};

function checkChannelType(channelType) {
    if (channelType == 'txt' || channelType == 'TEXT' || channelType == 'GUILD_TEXT') {
        return 'GUILD_TEXT';
    } else if (channelType == 'vc' || channelType == 'VOICE' || channelType == 'GUILD_VOICE') {
        return 'GUILD_VOICE';
    } else if (channelType == '') {
        return '';
    } else {
        return 'ERROR!';
    }
}

function createDeleteCommands(resultData) {
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
        '!deletecategory';
    for (var categoryId of resultCategoryIdList) {
        resultStr = resultStr + ' ' + categoryId;
    }

    resultStr += '\n\nチャンネル削除コマンド\n!deletechannel';
    for (var channelId of resultChannelIdList) {
        resultStr = resultStr + ' ' + channelId;
    }

    resultStr += '\n\nロール削除コマンド\n!deleterole';
    for (var roleId of resultRoleIdList) {
        resultStr = resultStr + ' ' + roleId;
    }

    fs.writeFileSync('./temp/temp.txt', resultStr);
    return new MessageAttachment('./temp/temp.txt', 'delete_commands.txt');
}
