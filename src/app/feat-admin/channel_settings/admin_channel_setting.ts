import {
    APIInteractionDataResolvedChannel,
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    ForumChannel,
    GuildTextBasedChannel,
} from 'discord.js';

import { ChannelService } from '../../../db/channel_service';
import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { exists, notExists } from '../../common/others';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function adminChannelSetting(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
    targetChannel:
        | CategoryChannel
        | ForumChannel
        | APIInteractionDataResolvedChannel
        | GuildTextBasedChannel,
    isAdminChannel: boolean,
) {
    try {
        const guild = await getGuildByInteraction(interaction);

        const dbChannel = await ChannelService.setAdminChannel(
            guild.id,
            targetChannel.id,
            isAdminChannel,
        );

        if (exists(dbChannel) && dbChannel.type === ChannelType.GuildCategory) {
            const channels = await ChannelService.getChannelsByCategoryId(
                guild.id,
                dbChannel.channelId,
            );

            for (const channel of channels) {
                const result = await ChannelService.setAdminChannel(
                    guild.id,
                    channel.channelId,
                    isAdminChannel,
                );

                if (notExists(result)) {
                    return null;
                }
            }
        }

        return dbChannel;
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
