import { prisma } from './prisma';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class MessageCountService {
    static async save(userId: string, count: number) {
        try {
            await prisma.messageCount.upsert({
                where: {
                    userId: userId,
                },
                update: {
                    count: count,
                },
                create: {
                    userId: userId,
                    count: count,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getMemberByUserId(userId: string) {
        try {
            const member = await prisma.messageCount.findUnique({
                where: {
                    userId: userId,
                },
            });
            return member;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }
}
