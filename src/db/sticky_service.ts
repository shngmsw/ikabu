import { prisma } from './prisma';
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
            logger.error(error);
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
            logger.error(error);
            return null;
        }
    }
}
