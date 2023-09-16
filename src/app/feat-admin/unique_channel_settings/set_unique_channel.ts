import { ChatInputCommandInteraction } from 'discord.js';

import { UniqueChannelService } from '../../../db/unique_channel_service';
import { log4js_obj } from '../../../log4js_settings';
import { exists } from '../../common/others';
import { isChannelKey } from '../../constant/channel_key';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function setUniqueChannelCommand(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) {
    try {
        const options = interaction.options;
        const key = options.getString('設定項目', true);
        const channel = options.getChannel('チャンネル', true);

        // keyがChannelKeyに存在するかチェック
        if (!isChannelKey(key)) {
            return await interaction.editReply({
                content: '存在しないキーが選択されたでし！',
            });
        }

        const registeredChannel = await UniqueChannelService.save(
            interaction.guildId,
            key,
            channel.id,
        );

        if (exists(registeredChannel)) {
            await interaction.editReply({
                content: `\`${channel.name}\`を\`${key}\`として設定したでし！`,
            });
        } else {
            await interaction.editReply({
                content: '設定に失敗したでし！',
            });
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
