import { Member } from '@prisma/client';

import { prisma } from './prisma.js';
import { RecruitService } from './recruit_service.js';
import { log4js_obj } from '../log4js_settings.js';
const logger = log4js_obj.getLogger('database');

export type ParticipantMember = {
    member: Member;
    userId: string;
    joinedAt: Date;
    userType: number;
};
export class ParticipantService {
    static async registerParticipant(guildId: string, messageId: string, userId: string, userType: number, joinedAt: Date) {
        try {
            await prisma.participant.upsert({
                where: {
                    guildId_messageId_userId: {
                        guildId: guildId,
                        messageId: messageId,
                        userId: userId,
                    },
                },
                update: {
                    userType: userType,
                    joinedAt: joinedAt,
                },
                create: {
                    guildId: guildId,
                    messageId: messageId,
                    userId: userId,
                    userType: userType,
                    joinedAt: joinedAt,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async registerParticipantFromMember(guildId: string, messageId: string, member: Member, userType: number) {
        try {
            await prisma.participant.upsert({
                where: {
                    guildId_messageId_userId: {
                        guildId: guildId,
                        messageId: messageId,
                        userId: member.userId,
                    },
                },
                update: {
                    userType: userType,
                },
                create: {
                    guildId: guildId,
                    messageId: messageId,
                    userId: member.userId,
                    userType: userType,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async deleteParticipant(guildId: string, messageId: string, userId: string) {
        try {
            await prisma.participant.delete({
                where: {
                    guildId_messageId_userId: {
                        guildId: guildId,
                        messageId: messageId,
                        userId: userId,
                    },
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async deleteAllParticipant(guildId: string, messageId: string) {
        try {
            await prisma.participant.deleteMany({
                where: {
                    guildId: guildId,
                    messageId: messageId,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async deleteUnuseParticipant() {
        try {
            const messageIdList = await RecruitService.getAllMessageId();

            await prisma.participant.deleteMany({
                where: {
                    messageId: {
                        notIn: messageIdList,
                    },
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getParticipant(guildId: string, messageId: string, userId: string): Promise<ParticipantMember | null> {
        try {
            const participant = await prisma.participant.findUnique({
                where: {
                    guildId_messageId_userId: {
                        guildId: guildId,
                        messageId: messageId,
                        userId: userId,
                    },
                },
                select: {
                    userId: true,
                    userType: true,
                    joinedAt: true,
                    member: true,
                },
            });
            return participant;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    static async getAllParticipants(guildId: string, messageId: string): Promise<ParticipantMember[]> {
        try {
            const participants = await prisma.participant.findMany({
                where: {
                    guildId: guildId,
                    messageId: messageId,
                },
                select: {
                    userId: true,
                    userType: true,
                    joinedAt: true,
                    member: true,
                },
                orderBy: [
                    {
                        userType: 'asc',
                    },
                    {
                        joinedAt: 'asc',
                    },
                ],
            });

            return participants;
        } catch (error) {
            logger.error(error);
            return [];
        }
    }
}
