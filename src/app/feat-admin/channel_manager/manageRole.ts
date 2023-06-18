import fs from 'fs';

import { stringify } from 'csv-stringify/sync';
import { AttachmentBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { createRole, searchRoleById, searchRoleIdByName, setColorToRole } from '../../common/manager/role_manager';
import { assertExistCheck, exists, notExists } from '../../common/others';

const logger = log4js_obj.getLogger('RoleManager');

export async function handleCreateRole(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    const guild = await interaction.guild.fetch();

    try {
        const roleName = options.getString('ロール名', true);
        let colorInput = options.getString('ロールカラー');

        if (exists(await searchRoleIdByName(guild, roleName))) {
            return await interaction.followUp('その名前のロールはもうあるでし！\n別のロール名を使うでし！');
        }

        if (notExists(colorInput)) {
            await interaction.followUp('色はこっちで決めさせてもらうでし！');
        } else if (!colorInput.match('^#([\\da-fA-F]{6})$')) {
            await interaction.followUp(
                '`' + colorInput + '`はカラーコードじゃないでし！\n`[ex]: #5d4efd, #111`\n色はこっちで決めさせてもらうでし！',
            );
            colorInput = null;
        }

        const roleId = await createRole(guild, roleName);

        await guild.roles.fetch();

        const role = await searchRoleById(guild, roleId);
        assertExistCheck(role);
        const colorCode = await setColorToRole(guild, role, colorInput);
        await role.setHoist(true);

        await interaction.followUp(
            'ロール名`' + role.name + '`を作ったでし！\nロールIDは`' + roleId + '`、カラーコードは`' + colorCode + '`でし！',
        );
    } catch (error) {
        logger.error(error);
        await interaction.followUp('なんかエラーでてるわ');
    }
}

export async function handleDeleteRole(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    let roleIdList = [];
    const roleId1 = options.getMentionable('ロール名1', true);
    const roleId2 = options.getMentionable('ロール名2');
    const roleId3 = options.getMentionable('ロール名3');
    roleIdList.push(roleId1.id);
    if (exists(roleId2)) {
        roleIdList.push(roleId2.id);
    }
    if (exists(roleId3)) {
        roleIdList.push(roleId3.id);
    }

    await interaction.editReply('指定されたIDのロールを削除中でし！\nちょっと待つでし！');

    const guild = await interaction.guild.fetch();
    const removed = [];

    removed.push(['ロールID', 'ロール名']);

    await interaction.editReply('0% 完了');

    roleIdList = Array.from(new Set(roleIdList));

    try {
        // i = index
        // removed[i][0] = deleted role (id)
        // removed[i][1] = deleted role (name)
        for (const i in roleIdList) {
            let roleName;
            const role = await searchRoleById(guild, roleIdList[i]);
            // if role ID is not found, consider as an error.
            if (notExists(role)) {
                roleName = 'NOT_FOUND!';
            } else {
                roleName = role.name;
                await role.delete();
                await guild.roles.fetch();
            }
            removed.push([roleIdList[i], roleName]);
            const progress = `${((+i + 1) / roleIdList.length) * 100}`;
            await interaction.editReply(parseInt(progress, 10) + '% 完了');
        }
    } catch (error) {
        logger.error(error);
        await interaction.editReply('ロール削除中にエラーでし！');
    }

    const csvString = stringify(removed);
    fs.writeFileSync('./temp/temp.csv', csvString);
    const attachment = new AttachmentBuilder('./temp/temp.csv', {
        name: 'removed_role.csv',
    });

    await interaction.followUp({
        content: '操作が完了したでし！\nしゃべると長くなるから下に削除したロールをまとめておいたでし！',
        files: [attachment],
    });
}

export async function handleAssignRole(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    try {
        const targetRoleId = options.getMentionable('ターゲットロール', true).id;
        const assignRole = options.getMentionable('割当ロール', true);
        const assignRoleId = assignRole.id;

        const targetRole = await searchRoleById(interaction.guild, targetRoleId);
        assertExistCheck(targetRole, 'targetRole');

        const targets = targetRole.members;

        for (const target of targets) {
            await target[1].roles.add(assignRoleId);
        }

        await interaction.editReply('`' + targetRole.name + '`のメンバーに`' + assignRole.name + '`のロールつけたでし！');
    } catch (error) {
        logger.error(error);
        await interaction.editReply('なんかエラーでてるわ');
    }
}

export async function handleUnassignRole(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return await interaction.editReply('ロールを管理する権限がないでし！');
    }

    try {
        const targetRoleId = options.getMentionable('ターゲットロール').id;
        const unAssignRole = options.getMentionable('解除ロール');
        const unAssignRoleId = unAssignRole.id;

        const targetRole = await searchRoleById(interaction.guild, targetRoleId);
        assertExistCheck(targetRole, 'targetRole');
        const targets = targetRole.members;

        for (const target of targets) {
            await target[1].roles.remove(unAssignRoleId);
        }

        await interaction.editReply('`' + targetRole.name + '`のメンバーから`' + unAssignRole.name + '`のロールを削除したでし！');
    } catch (error) {
        logger.error(error);
        await interaction.editReply('なんかエラーでてるわ');
    }
}
