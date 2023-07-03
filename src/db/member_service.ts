import { Member } from '@prisma/client';

import { prisma } from './prisma';
import { modalRecruit } from '../constant';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class MemberService {
    static async registerMember(member: Member) {
        try {
            await prisma.member.upsert({
                where: {
                    guildId_userId: {
                        guildId: member.guildId,
                        userId: member.userId,
                    },
                },
                update: {
                    displayName: member.displayName,
                    iconUrl: member.iconUrl,
                },
                create: {
                    guildId: member.guildId,
                    userId: member.userId,
                    displayName: member.displayName,
                    iconUrl: member.iconUrl,
                    joinedAt: member.joinedAt,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async updateMemberProfile(member: Member) {
        try {
            await prisma.member.update({
                where: {
                    guildId_userId: {
                        guildId: member.guildId,
                        userId: member.userId,
                    },
                },
                data: {
                    displayName: member.displayName,
                    iconUrl: member.iconUrl,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async updateJoinedAt(guildId: string, userId: string, joinedAt: Date) {
        try {
            await prisma.member.update({
                where: {
                    guildId_userId: {
                        guildId: guildId,
                        userId: userId,
                    },
                },
                data: {
                    joinedAt: joinedAt,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async getMemberByUserId(guildId: string, userId: string) {
        try {
            const member = await prisma.member.findUnique({
                where: {
                    guildId_userId: {
                        guildId: guildId,
                        userId: userId,
                    },
                },
            });

            return member;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    static async getMemberGuildIdsByUserId(userId: string) {
        try {
            const members = await prisma.member.findMany({
                where: {
                    userId: userId,
                },
            });
            const guildIds: string[] = [];
            for (const member of members) {
                guildIds.push(member.guildId);
            }
            return guildIds;
        } catch (error) {
            logger.error(error);
            return [];
        }
    }

    // ダミーを作らないとModalでエラーが出るため
    static async createDummyUser(guildId: string) {
        try {
            // 既存のメンバーを検索します
            const members = await prisma.member.findMany({
                where: {
                    guildId: guildId,
                    userId: {
                        startsWith: 'attendee',
                    },
                },
            });

            // 既存のメンバーが3人未満の場合はダミーユーザーを作成
            if (members.length < 3) {
                const dummyUsers = [
                    {
                        guildId: guildId,
                        userId: 'attendee1',
                        displayName: '参加確定者1',
                        iconUrl: modalRecruit.placeHold,
                        joinedAt: new Date(),
                    },
                    {
                        guildId: guildId,
                        userId: 'attendee2',
                        displayName: '参加確定者2',
                        iconUrl: modalRecruit.placeHold,
                        joinedAt: new Date(),
                    },
                    {
                        guildId: guildId,
                        userId: 'attendee3',
                        displayName: '参加確定者3',
                        iconUrl: modalRecruit.placeHold,
                        joinedAt: new Date(),
                    },
                ];

                // 既存のダミーユーザーのuserIdを抽出
                const existingUserIds = members.map((member) => member.userId);

                // 既に存在するダミーユーザーを除外
                const usersToCreate = dummyUsers.filter((user) => !existingUserIds.includes(user.userId));

                // 新たに作成すべきダミーユーザーを追加
                for (const user of usersToCreate) {
                    await prisma.member.create({
                        data: user,
                    });
                    logger.info(`dummy user created: ${user.userId}`);
                }
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
