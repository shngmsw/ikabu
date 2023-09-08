import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';

import { setUniqueChannelCommand } from './set_unique_channel';
import { showAllUniqueChannelSettings } from './show_all_unique_channel';
import { unsetUniqueChannelCommand } from './unset_unique_channel';
import { log4js_obj } from '../../../log4js_settings';
import { getAPIMemberByInteraction } from '../../common/manager/member_manager';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function uniqueChannelSettingsHandler(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const member = await getAPIMemberByInteraction(interaction);

        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return await interaction.editReply({
                content: 'チャンネルを管理する権限がないでし！',
            });
        }

        switch (interaction.options.getSubcommand()) {
            case '全設定表示':
                await showAllUniqueChannelSettings(interaction);
                break;
            case '登録':
                await setUniqueChannelCommand(interaction);
                break;
            case '解除':
                await unsetUniqueChannelCommand(interaction);
                break;
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
