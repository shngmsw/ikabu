import { ChatInputCommandInteraction, Guild, PermissionsBitField } from 'discord.js';

import { deleteVariables } from './delete_variables';
import { setVariables } from './set_variables';
import { showVariables } from './show_variables';
import { searchChannelById } from '../../common/manager/channel_manager';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, exists, notExists } from '../../common/others';

export async function variablesHandler(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    await interaction.deferReply({ ephemeral: true });
    const guild = await getGuildByInteraction(interaction);
    const member = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(member, 'member');
    if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.editReply({
            content: 'チャンネルを管理する権限がないでし！',
        });
    }

    if (
        exists(interaction.channel) &&
        interaction.channel.parentId !== process.env.CATEGORY_PARENT_ID_ADMIN_ONLY
    ) {
        return sendChannelError(interaction, guild);
    }

    switch (interaction.options.getSubcommand()) {
        case '表示':
            void showVariables(interaction);
            break;
        case '登録更新':
            void setVariables(interaction);
            break;
        case '削除':
            void deleteVariables(interaction);
            break;
    }
}

async function sendChannelError(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    guild: Guild,
) {
    const envChannelId = process.env.CATEGORY_PARENT_ID_ADMIN_ONLY;
    if (notExists(envChannelId)) {
        // .envに記載がない場合
        await interaction.editReply({
            content: '`CATEGORY_PARENT_ID_ADMIN_ONLY`が正しく設定されているか確認するでし！',
        });
    } else {
        // .envに記載がある場合
        const envChannel = await searchChannelById(guild, envChannelId);
        if (notExists(envChannel)) {
            // .envのカテゴリIDが間違っている場合
            await interaction.editReply({
                content: '`CATEGORY_PARENT_ID_ADMIN_ONLY`が正しく設定されているか確認するでし！',
            });
        } else {
            // .envで指定されたカテゴリと一致しない場合
            await interaction.editReply({
                content: 'このカテゴリでは使えないでし！',
            });
        }
    }
}
