import { prisma } from './prisma';
import { sendErrorLogs } from '../app/logs/error/send_error_logs';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class StickyService {
    static async registerMessageId(
        guildId: string,
        channelId: string,
        key: string,
        messageId: string,
    ) {
        try {
            await prisma.sticky.upsert({
                where: {
                    guildId_channelId_key: {
                        guildId: guildId,
                        channelId: channelId,
                        key: key,
                    },
                },
                update: {
                    messageId: messageId,
                },
                create: {
                    guildId: guildId,
                    channelId: channelId,
                    key: key,
                    messageId: messageId,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }

    static async getMessageId(guildId: string, channelId: string, key: string) {
        try {
            const sticky = await prisma.sticky.findUnique({
                where: {
                    guildId_channelId_key: {
                        guildId: guildId,
                        channelId: channelId,
                        key: key,
                    },
                },
            });
            if (sticky) {
                return sticky.messageId;
            } else {
                return null;
            }
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }
}
