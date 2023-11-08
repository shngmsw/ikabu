import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';

import { deleteVariables } from './delete_variables';
import { setVariables } from './set_variables';
import { showVariables } from './show_variables';
import { ChannelService } from '../../../db/channel_service';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { getAPIMemberByInteraction } from '../../common/manager/member_manager';
import { notExists } from '../../common/others';

export async function variablesHandler(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    await interaction.deferReply({ ephemeral: true });
    const guild = await getGuildByInteraction(interaction);
    const member = await getAPIMemberByInteraction(interaction);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.editReply({
            content: 'チャンネルを管理する権限がないでし！',
        });
    }

    const storedChannel = await ChannelService.getChannel(guild.id, interaction.channelId);

    if (notExists(storedChannel)) {
        return await interaction.editReply({
            content: 'このチャンネルの情報を取得できないでし！',
        });
    }

    if (!storedChannel.isAdminChannel) {
        return await interaction.editReply({
            content: 'このチャンネルでは使えないでし！',
        });
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
