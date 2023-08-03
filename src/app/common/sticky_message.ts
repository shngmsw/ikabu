import { Guild, MessagePayload, MessageCreateOptions } from 'discord.js';

import { searchChannelById } from './manager/channel_manager';
import { searchMessageById } from './manager/message_manager';
import { exists } from './others';
import { StickyService } from '../../db/sticky_service';
import { log4js_obj } from '../../log4js_settings';

const logger = log4js_obj.getLogger('message');

export async function sendStickyMessage(
    guild: Guild,
    channelId: string,
    content: string | MessagePayload | MessageCreateOptions,
) {
    const lastStickyMsgId = await StickyService.getMessageId(guild.id, channelId);
    if (exists(lastStickyMsgId)) {
        const lastStickyMsg = await searchMessageById(guild, channelId, lastStickyMsgId);
        if (exists(lastStickyMsg)) {
            try {
                await lastStickyMsg.delete();
            } catch (error) {
                logger.warn(`last sticky message not found! [${lastStickyMsgId}]`);
            }
        }
    }
    const channel = await searchChannelById(guild, channelId);
    if (exists(channel) && channel.isTextBased()) {
        const stickyMessage = await channel.send(content);
        await StickyService.registerMessageId(guild.id, channelId, stickyMessage.id);
    }
}
