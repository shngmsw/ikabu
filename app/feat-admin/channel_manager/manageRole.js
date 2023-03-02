const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const { isEmpty, isNotEmpty } = require('../../common/others');
const { createRole, searchRoleById, setColorToRole, searchRoleIdByName } = require('../../common/manager/roleManager');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('RoleManager');

module.exports = {
    handleCreateRole: handleCreateRole,
    handleDeleteRole: handleDeleteRole,
    handleAssignRole: handleAssignRole,
    handleUnassignRole: handleUnassignRole,
};

async function handleCreateRole(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    const guild = await interaction.guild.fetch();

    try {
        let roleName = options.getString('ロール名');
        let colorInput = options.getString('ロールカラー');

        if (isNotEmpty(await searchRoleIdByName(guild, roleName))) {
            return await interaction.followUp('その名前のロールはもうあるでし！\n別のロール名を使うでし！');
        }

        if (isEmpty(colorInput)) {
            await interaction.followUp('色はこっちで決めさせてもらうでし！');
        } else if (!colorInput.match('^#([\\da-fA-F]{6})$')) {
            await interaction.followUp(
                '`' + colorInput + '`はカラーコードじゃないでし！\n`[ex]: #5d4efd, #111`\n色はこっちで決めさせてもらうでし！',
            );
            colorInput = null;
        }

        var roleId = await createRole(guild, roleName);

        await guild.roles.fetch();

        var role = await searchRoleById(guild, roleId);
        var colorCode = await setColorToRole(guild, role, colorInput);
        role.setHoist(true);

        await interaction.followUp(
            'ロール名`' + role.name + '`を作ったでし！\nロールIDは`' + roleId + '`、カラーコードは`' + colorCode + '`でし！',
        );
    } catch (error) {
        logger.error(error);
        await interaction.followUp('なんかエラーでてるわ');
    }
}

async function handleDeleteRole(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
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

    await interaction.editReply('指定されたIDのロールを削除中でし！\nちょっと待つでし！');

    const guild = await interaction.guild.fetch();
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
            var role = await searchRoleById(guild, roleIdList[i]);
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
        logger.error(error);
        await interaction.editReply('ロール削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new AttachmentBuilder('./temp/temp.csv', 'removed_role.csv');

    await interaction.followUp({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したロールをまとめておいたでし！',
        files: [attachment],
    });
}

async function handleAssignRole(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    try {
        const targetRoleId = options.getMentionable('ターゲットロール').id;
        const assignRole = options.getMentionable('割当ロール');
        let assignRoleId = assignRole.id;

        const targetRole = await searchRoleById(interaction.guild, targetRoleId);

        let targets = targetRole.members;

        for (var target of targets) {
            await target[1].roles.add(assignRoleId);
        }

        await interaction.editReply('`' + targetRole.name + '`のメンバーに`' + assignRole.name + '`のロールつけたでし！');
    } catch (error) {
        logger.error(error);
        await interaction.editReply('なんかエラーでてるわ');
    }
}

async function handleUnassignRole(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    try {
        const targetRoleId = options.getMentionable('ターゲットロール').id;
        const unAssignRole = options.getMentionable('解除ロール');
        let unAssignRoleId = unAssignRole.id;

        const targetRole = await searchRoleById(interaction.guild, targetRoleId);

        var targets = targetRole.members;

        for (var target of targets) {
            await target[1].roles.remove(unAssignRoleId);
        }

        await interaction.editReply('`' + targetRole.name + '`のメンバーから`' + unAssignRole.name + '`のロールを削除したでし！');
    } catch (error) {
        logger.error(error);
        await interaction.editReply('なんかエラーでてるわ');
    }
}
