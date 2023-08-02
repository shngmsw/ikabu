import { CategoryChannel, ChatInputCommandInteraction, Guild } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { searchRoleById, searchRoleIdByName, unassginRoleFromMembers } from '../../common/manager/role_manager';
import { assertExistCheck } from '../../common/others';

const logger = log4js_obj.getLogger('interaction');

export async function festEnd(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, guild: Guild, categoryChannel: CategoryChannel) {
    // フェスカテゴリのチャンネルを非表示にする
    try {
        const channels = categoryChannel.children.cache;
        channels.each(async (channel) => {
            await channel.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });
        });
        await interaction.editReply('フェス設定を`オフ`にしたでし！');
    } catch (error) {
        logger.error(error);
        await interaction.editReply('設定中にエラーが発生したでし！');
    }

    const unassignFestivalRole = interaction.options.getBoolean('フェスロールを外す', false) ?? false;

    if (!unassignFestivalRole) {
        return;
    }

    await interaction.followUp('フェスロールを外していくでし！');

    // フェスロールを外す
    try {
        const shiverId = await searchRoleIdByName(guild, 'フウカ陣営');
        assertExistCheck(shiverId, '[role name: フウカ陣営]');
        const shiverRole = await searchRoleById(guild, shiverId);
        assertExistCheck(shiverRole, 'shiverRole');
        const shiverCount = shiverRole.members.size;
        const success = await unassginRoleFromMembers(shiverId, shiverRole.members);
        if (success) {
            await interaction.followUp(`\`フウカ陣営\`ロールを外したでし！ \`[${shiverCount}]\``);
        } else {
            await interaction.followUp('`フウカ陣営`ロールを外すのに失敗したでし！');
        }
    } catch (error) {
        logger.error(error);
        await interaction.followUp('`フウカ陣営`ロールを外すのに失敗したでし！');
    }

    try {
        const fryeId = await searchRoleIdByName(guild, 'ウツホ陣営');
        assertExistCheck(fryeId, '[role name: ウツホ陣営]');
        const fryeRole = await searchRoleById(guild, fryeId);
        assertExistCheck(fryeRole, 'fryeRole');
        const fryeCount = fryeRole.members.size;
        const success = await unassginRoleFromMembers(fryeId, fryeRole.members);
        if (success) {
            await interaction.followUp(`\`ウツホ陣営\`ロールを外したでし！ \`[${fryeCount}]\``);
        } else {
            await interaction.followUp('`ウツホ陣営`ロールを外すのに失敗したでし！');
        }
    } catch (error) {
        logger.error(error);
        await interaction.followUp('`ウツホ陣営`ロールを外すのに失敗したでし！');
    }

    try {
        const bigmanId = await searchRoleIdByName(guild, 'マンタロー陣営');
        assertExistCheck(bigmanId, '[role name: マンタロー陣営]');
        const bigmanRole = await searchRoleById(guild, bigmanId);
        assertExistCheck(bigmanRole, 'bigmanRole');
        const bigmanCount = bigmanRole.members.size;
        const success = await unassginRoleFromMembers(bigmanId, bigmanRole.members);
        if (success) {
            await interaction.followUp(`\`マンタロー陣営\`ロールを外したでし！ \`[${bigmanCount}]\``);
        } else {
            await interaction.followUp('`マンタロー陣営`ロールを外すのに失敗したでし！');
        }
    } catch (error) {
        logger.error(error);
        await interaction.followUp('`マンタロー陣営`ロールを外すのに失敗したでし！');
    }
}
