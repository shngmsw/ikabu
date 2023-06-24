import { prisma } from './prisma';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class ReactionService {
    static async save(emojiId: string, emojiName: string, count: number) {
        try {
            await prisma.reaction.upsert({
                where: {
                    emojiId_emojiName: {
                        emojiId: emojiId,
                        emojiName: emojiName,
                    },
                },
                update: {
                    count: count,
                },
                create: {
                    emojiId: emojiId,
                    emojiName: emojiName,
                    count: count,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async update(reactionSeq: number, count: number) {
        try {
            await prisma.reaction.update({
                where: {
                    reactionSeq: reactionSeq,
                },
                data: {
                    count: count,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getTotalReactionByEmoji(emojiId: string, emojiName: string) {
        try {
            const result = await prisma.reaction.findUnique({
                where: {
                    emojiId_emojiName: {
                        emojiId: emojiId,
                        emojiName: emojiName,
                    },
                },
            });
            return result;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }
}
