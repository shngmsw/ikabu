import { prisma } from './prisma';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class RecruitCountService {
    static async saveRecruitCount(userId: string, count: number) {
        try {
            await prisma.recruitCount.upsert({
                where: {
                    userId: userId,
                },
                update: {
                    recruitCount: count,
                },
                create: {
                    userId: userId,
                    recruitCount: count,
                    joinCount: 0,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async saveJoinCount(userId: string, count: number) {
        try {
            await prisma.recruitCount.upsert({
                where: {
                    userId: userId,
                },
                update: {
                    joinCount: count,
                },
                create: {
                    userId: userId,
                    recruitCount: 0,
                    joinCount: count,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getCountByUserId(userId: string) {
        try {
            const counter = await prisma.recruitCount.findUnique({
                where: {
                    userId: userId,
                },
            });
            return counter;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }
}
