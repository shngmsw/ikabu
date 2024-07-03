import { ChatInputCommandInteraction } from 'discord.js';

import { handleCreateRoom } from './create_room';
import { handleDeleteCategory } from './delete_category';
import { handleDeleteChannel } from './delete_channel';
import {
    handleAssignRole,
    handleCreateRole,
    handleDeleteRole,
    handleUnassignRole,
} from './manage_role';

export async function channelManagerHandler(interaction: ChatInputCommandInteraction<'cached'>) {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case 'チャンネル作成':
            await handleCreateRoom(interaction);
            break;
        case 'ロール作成':
            await handleCreateRole(interaction);
            break;
        case 'ロール割当':
            await handleAssignRole(interaction);
            break;
        case 'ロール解除':
            await handleUnassignRole(interaction);
            break;
        case 'カテゴリー削除':
            await handleDeleteCategory(interaction);
            break;
        case 'チャンネル削除':
            await handleDeleteChannel(interaction);
            break;
        case 'ロール削除':
            await handleDeleteRole(interaction);
            break;
    }
}
