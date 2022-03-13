const { MessageAttachment } = require('discord.js');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const { createRole, searchRoleById, setColorToRole } = require('../../manager/roleManager.js');

module.exports.handleCreateRole = async function (msg) {
    if (!msg.member.permissions.has('MANAGE_ROLES')) {
        return msg.reply('ロールを管理する権限がないでし！');
    }

    try {
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

        var roleName;
        var colorInput;

        if (args.length == 0) {
            return msg.reply('作成するロール名を入力するでし！\n`[usage]: !createrole ロール名 [カラーコード(option)]`');
        } else if (args.length == 1) {
            roleName = args[0];
            colorInput = null;
        } else {
            roleName = args[0];
            if (args[1].match('^#([\\da-fA-F]{6})$')) {
                colorInput = args[1];
            } else {
                colorInput = null;
                msg.channel.send(
                    '`' + args[1] + '`はカラーコードじゃないでし！\n`[ex]: #5d4efd, #111`\n色はこっちで決めさせてもらうでし！',
                );
            }
        }

        if (searchRoleIdByName(msg.guild, roleName) != null) {
            return msg.reply('その名前のロールはもうあるでし！\n別のロール名を使うでし！');
        }

        var roleId = await createRole(msg.guild, roleName);

        await msg.guild.roles.fetch();

        var role = searchRoleById(msg.guild, roleId);
        var colorCode = await setColorToRole(msg.guild, role, colorInput);
        role.setHoist(true);

        msg.reply('ロール名`' + role.name + '`を作ったでし！\nロールIDは`' + roleId + '`、カラーコードは`' + colorCode + '`でし！');
    } catch (error) {
        console.error(error);
        msg.channel.send('なんかエラーでてるわ');
    }
};

module.exports.handleDeleteRole = async function (msg) {
    if (!msg.member.permissions.has('MANAGE_ROLES')) {
        return msg.reply('ロールを管理する権限がないでし！');
    }

    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = strCmd.replace('\x20+', ' ');
    const splits = strCmd.split(' ');
    splits.shift();
    var roleIdList = [];
    for (var argument of splits) {
        if (argument != '') {
            roleIdList.push(argument);
        }
    }

    if (roleIdList.length == 0) {
        return msg.reply('削除したいロールのIDを入れるでし！');
    }

    msg.channel.send('指定されたIDのロールを削除中でし！\nちょっと待つでし！');

    const guild = msg.guild;
    var removed = [];

    removed.push(['ロールID', 'ロール名']);

    const progressMsg = await msg.channel.send('0% 完了');

    roleIdList = Array.from(new Set(roleIdList));

    try {
        // i = index
        // removed[i][0] = deleted role (id)
        // removed[i][1] = deleted role (name)
        for (var i in roleIdList) {
            var roleName;
            var role = searchRoleById(guild, roleIdList[i]);
            // if role ID is not found, consider as an error.
            if (role == null) {
                roleName = 'NOT_FOUND!';
            } else {
                roleName = role.name;
                await role.delete();
                await guild.roles.fetch();
            }
            removed.push([roleIdList[i], roleName]);

            await progressMsg.edit(parseInt(((+i + 1) / roleIdList.length) * 100, 10) + '% 完了');
        }
    } catch (error) {
        console.error(error);
        msg.reply('ロール削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new MessageAttachment('./temp/temp.csv', 'removed_role.csv');

    msg.reply({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したロールをまとめておいたでし！',
        files: [attachment],
    });
};

/**
 * ロール名からロールIDを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
function searchRoleIdByName(guild, roleName) {
    var role = guild.roles.cache.find((role) => role.name === roleName);

    if (role != null) {
        return role.id;
    } else {
        return null;
    }
}
