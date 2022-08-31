const { MessageAttachment } = require('discord.js');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const app = require('app-root-path').resolve('app');
const { createRole, searchRoleById, setColorToRole } = require(app + '/manager/roleManager.js');

module.exports.handleCreateRole = async function (interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
        return interaction.editReply('ロールを管理する権限がないでし！');
    }

    try {
        let roleName = options.getString('ロール名');
        let colorInput = options.getString('ロールカラー');

        if (!colorInput.match('^#([\\da-fA-F]{6})$')) {
            interaction.followUp(
                '`' + colorInput + '`はカラーコードじゃないでし！\n`[ex]: #5d4efd, #111`\n色はこっちで決めさせてもらうでし！',
            );
            colorInput = null;
        }

        if (searchRoleIdByName(interaction.guild, roleName) != null) {
            return interaction.followUp('その名前のロールはもうあるでし！\n別のロール名を使うでし！');
        }

        var roleId = await createRole(interaction.guild, roleName);

        await interaction.guild.roles.fetch();

        var role = searchRoleById(interaction.guild, roleId);
        var colorCode = await setColorToRole(interaction.guild, role, colorInput);
        role.setHoist(true);

        interaction.followUp(
            'ロール名`' + role.name + '`を作ったでし！\nロールIDは`' + roleId + '`、カラーコードは`' + colorCode + '`でし！',
        );
    } catch (error) {
        console.error(error);
        interaction.followUp('なんかエラーでてるわ');
    }
};

module.exports.handleDeleteRole = async function (interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;
    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
        return interaction.editReply('ロールを管理する権限がないでし！');
    }

    var roleIdList = [];
    const roleId1 = options.getMentionable('ロール名1');
    const roleId2 = options.getMentionable('ロール名2');
    const roleId3 = options.getMentionable('ロール名3');
    roleIdList.push(roleId1.id);
    if (roleId2 != null) {
        roleIdList.push(roleId2.id);
    }
    if (roleId3 != null) {
        roleIdList.push(roleId3.id);
    }

    interaction.editReply('指定されたIDのロールを削除中でし！\nちょっと待つでし！');

    const guild = interaction.guild;
    var removed = [];

    removed.push(['ロールID', 'ロール名']);

    await interaction.editReply('0% 完了');

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

            await interaction.editReply(parseInt(((+i + 1) / roleIdList.length) * 100, 10) + '% 完了');
        }
    } catch (error) {
        console.error(error);
        interaction.editReply('ロール削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new MessageAttachment('./temp/temp.csv', 'removed_role.csv');

    interaction.followUp({
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
