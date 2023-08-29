import { prisma } from './prisma';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class VoiceCountService {
    static async saveVoiceCount(userId: string, totalSec: number) {
        try {
            await prisma.voiceCount.upsert({
                where: {
                    userId: userId,
                },
                update: {
                    totalSec: totalSec,
                },
                create: {
                    userId: userId,
                    totalSec: totalSec,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async saveStartTime(userId: string, startTime: Date | null) {
        try {
            await prisma.voiceCount.upsert({
                where: {
                    userId: userId,
                },
                update: {
                    startTime: startTime,
                },
                create: {
                    userId: userId,
                    startTime: startTime,
                    totalSec: 0,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getCountByUserId(userId: string) {
        try {
            const counter = await prisma.voiceCount.findUnique({
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

    static async getInCallCount() {
        try {
            const counter = await prisma.voiceCount.findMany({
                where: {
                    startTime: {
                        not: null,
                    },
                },
            });
            return counter;
        } catch (error) {
            logger.error(error);
            return [];
        }
    }
}
