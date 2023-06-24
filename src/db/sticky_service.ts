import { prisma } from './prisma';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class StickyService {
    static async registerMessageId(guildId: string, channelId: string, messageId: string) {
        try {
            await prisma.sticky.upsert({
                where: {
                    guildId_channelId: {
                        guildId: guildId,
                        channelId: channelId,
                    },
                },
                update: {
                    messageId: messageId,
                },
                create: {
                    guildId: guildId,
                    channelId: channelId,
                    messageId: messageId,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getMessageId(guildId: string, channelId: string) {
        try {
            const sticky = await prisma.sticky.findUnique({
                where: {
                    guildId_channelId: {
                        guildId: guildId,
                        channelId: channelId,
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
