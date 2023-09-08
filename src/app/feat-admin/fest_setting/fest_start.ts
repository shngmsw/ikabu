import { CategoryChannel, ChatInputCommandInteraction, Guild } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function festStart(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    guild: Guild,
    categoryChannel: CategoryChannel,
) {
    try {
        const channels = categoryChannel.children.cache;
        channels.each(async (channel) => {
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
                ViewChannel: true,
            });
        });
        return await interaction.editReply('フェス設定を`オン`にしたでし！');
    } catch (error) {
        await sendErrorLogs(logger, error);
        return await interaction.editReply('設定中にエラーが発生したでし！');
    }
}
