import { prisma } from './prisma.js';
import { ObjectValueList } from '../app/constant/constant_common.js';
import { sendErrorLogs } from '../app/logs/error/send_error_logs.js';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export const RecruitType = {
    None: 0,
    PrivateRecruit: 1,
    RegularRecruit: 2,
    AnarchyRecruit: 3,
    EventRecruit: 4,
    SalmonRecruit: 5,
    FestivalRecruit: 6,
    BigRunRecruit: 7,
    TeamContestRecruit: 8,
    OtherGameRecruit: 10,
} as const;
export type RecruitType = ObjectValueList<typeof RecruitType>;
export function isRecruitType(value: number): value is RecruitType {
    return Object.values(RecruitType).some((v) => v === value);
}

export class RecruitService {
    static async registerRecruit(
        guildId: string,
        channelId: string,
        messageId: string,
        authorId: string,
        recruitNum: number,
        condition: string,
        vcName: string | null,
        eventId: string | null,
        recruitType: number,
        option?: string | null,
    ) {
        try {
            await prisma.recruit.create({
                data: {
                    guildId: guildId,
                    channelId: channelId,
                    messageId: messageId,
                    authorId: authorId,
                    recruitNum: recruitNum,
                    condition: condition,
                    vcName: vcName,
                    eventId: eventId,
                    recruitType: recruitType,
                    option: option,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }

    static async deleteRecruit(guildId: string, messageId: string) {
        try {
            await prisma.recruit.delete({
                where: {
                    guildId_messageId: {
                        guildId: guildId,
                        messageId: messageId,
                    },
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }

    static async updateRecruitNum(guildId: string, messageId: string, recruitNum: number) {
        try {
            await prisma.recruit.update({
                where: {
                    guildId_messageId: {
                        guildId: guildId,
                        messageId: messageId,
                    },
                },
                data: {
                    recruitNum: recruitNum,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }

    static async updateCondition(guildId: string, messageId: string, condition: string) {
        try {
            await prisma.recruit.update({
                where: {
                    guildId_messageId: {
                        guildId: guildId,
                        messageId: messageId,
                    },
                },
                data: {
                    condition: condition,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }

    static async getRecruit(guildId: string, messageId: string) {
        try {
            const recruit = await prisma.recruit.findUnique({
                where: {
                    guildId_messageId: {
                        guildId: guildId,
                        messageId: messageId,
                    },
                },
            });
            return recruit;
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getRecruitsByRecruitType(guildId: string, recruitType: number) {
        try {
            const recruits = await prisma.recruit.findMany({
                where: {
                    guildId: guildId,
                    recruitType: recruitType,
                },
            });
            return recruits;
        } catch (error) {
            await sendErrorLogs(logger, error);
            return [];
        }
    }

    static async getRecruitsByChannelId(guildId: string, channelId: string) {
        try {
            const recruits = await prisma.recruit.findMany({
                where: {
                    guildId: guildId,
                    channelId: channelId,
                },
            });
            return recruits;
        } catch (error) {
            await sendErrorLogs(logger, error);
            return [];
        }
    }

    static async getAllMessageId() {
        try {
            const recruits = await prisma.recruit.findMany({
                select: {
                    messageId: true,
                },
                distinct: ['messageId'],
            });

            const result = recruits.map((recruit) => {
                return recruit.messageId;
            });

            return result;
        } catch (error) {
            await sendErrorLogs(logger, error);
            return [];
        }
    }
}
