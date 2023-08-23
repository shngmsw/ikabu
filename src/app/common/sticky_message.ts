import { Guild, MessagePayload, MessageCreateOptions } from 'discord.js';

import { searchChannelById } from './manager/channel_manager';
import { searchMessageById } from './manager/message_manager';
import { StickyService } from '../../db/sticky_service';
import { log4js_obj } from '../../log4js_settings';

const logger = log4js_obj.getLogger('message');

type AsyncVoidFunction = () => Promise<void>;

// キューを管理する変数
const messageQueue: AsyncVoidFunction[] = [];

let isProcessing = false;

export async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    while (messageQueue.length > 0) {
        const task = messageQueue.shift();
        if (task) {
            await task();
        }
    }

    isProcessing = false;
}

export async function sendStickyMessage(
    guild: Guild,
    channelId: string,
    content: string | MessagePayload | MessageCreateOptions,
) {
    const task: AsyncVoidFunction = async () => {
        const lastStickyMsgId = await StickyService.getMessageId(guild.id, channelId);
        if (lastStickyMsgId) {
            const lastStickyMsg = await searchMessageById(guild, channelId, lastStickyMsgId);
            if (lastStickyMsg) {
                try {
                    await lastStickyMsg.delete();
                } catch (error) {
                    logger.warn(`last sticky message not found! [${lastStickyMsgId}]`);
                }
            }
        }
        const channel = await searchChannelById(guild, channelId);
        if (channel && channel.isTextBased()) {
            const stickyMessage = await channel.send(content);
            await StickyService.registerMessageId(guild.id, channelId, stickyMessage.id);
        }
    };

    // キューにタスクを追加
    messageQueue.push(task);

    // キューの処理を開始（すでに処理中であれば何もしない）
    await processQueue();
}
