import { Member } from '@prisma/client';
import { GuildMember } from 'discord.js';

import { prisma } from './prisma';
import { UniqueRoleService } from './unique_role_service';
import { exists } from '../app/common/others';
import { RoleKeySet } from '../app/constant/role_key';
import { sendErrorLogs } from '../app/logs/error/send_error_logs';
import { modalRecruit } from '../constant';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class MemberService {
    static async registerMemberObj(member: Member): Promise<Member | null> {
        try {
            return await prisma.member.upsert({
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
                    isRookie: true,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async registerMember(
        guildId: string,
        userId: string,
        displayName: string,
        iconUrl: string,
        joinedAt: Date,
        isRookie?: boolean,
    ): Promise<Member | null> {
        try {
            return await prisma.member.upsert({
                where: {
                    guildId_userId: {
                        guildId: guildId,
                        userId: userId,
                    },
                },
                update: {
                    displayName: displayName,
                    iconUrl: iconUrl,
                },
                create: {
                    guildId: guildId,
                    userId: userId,
                    displayName: displayName,
                    iconUrl: iconUrl,
                    joinedAt: joinedAt,
                    isRookie: isRookie ?? true,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    /**
     * GuildMemberオブジェクトをMemberテーブルに登録/更新 (項目: displayName, iconUrl, isRookie, (登録時: joinedAt))
     * @param member GuildMember オブジェクト
     * @returns 登録後のMemberオブジェクト
     */
    static async setGuildMemberToDB(member: GuildMember): Promise<Member | null> {
        try {
            const iconUrl = member
                .displayAvatarURL()
                .replace('.webp', '.png')
                .replace('.webm', '.gif');

            let hasRookieRole = false;
            const rookieRoleId = await UniqueRoleService.getRoleIdByKey(
                member.guild.id,
                RoleKeySet.Rookie.key,
            );

            // rookieRoleが存在するサーバの場合、新入部員ロールを持っているか確認
            if (exists(rookieRoleId)) {
                const memberRoles = member.roles.cache.get(rookieRoleId);
                if (exists(memberRoles)) {
                    hasRookieRole = true;
                }
            }
            return await prisma.member.upsert({
                where: {
                    guildId_userId: {
                        guildId: member.guild.id,
                        userId: member.user.id,
                    },
                },
                update: {
                    displayName: member.displayName,
                    iconUrl: iconUrl,
                    isRookie: hasRookieRole,
                },
                create: {
                    guildId: member.guild.id,
                    userId: member.user.id,
                    displayName: member.displayName,
                    iconUrl: iconUrl,
                    joinedAt: member.joinedAt,
                    isRookie: hasRookieRole,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async updateMember(member: Member) {
        try {
            return await prisma.member.update({
                where: {
                    guildId_userId: {
                        guildId: member.guildId,
                        userId: member.userId,
                    },
                },
                data: {
                    displayName: member.displayName,
                    iconUrl: member.iconUrl,
                    joinedAt: member.joinedAt,
                    isRookie: member.isRookie,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }

    static async updateJoinedAt(
        guildId: string,
        userId: string,
        joinedAt: Date,
    ): Promise<Member | null> {
        try {
            return await prisma.member.update({
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
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async setRookieFlag(
        guildId: string,
        userId: string,
        isRookie: boolean,
    ): Promise<Member | null> {
        try {
            return await prisma.member.update({
                where: {
                    guildId_userId: {
                        guildId: guildId,
                        userId: userId,
                    },
                },
                data: {
                    isRookie: isRookie,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getMemberByUserId(guildId: string, userId: string): Promise<Member | null> {
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
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getMemberGuildIdsByUserId(userId: string): Promise<string[]> {
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
            await sendErrorLogs(logger, error);
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
                const usersToCreate = dummyUsers.filter(
                    (user) => !existingUserIds.includes(user.userId),
                );

                // 新たに作成すべきダミーユーザーを追加
                for (const user of usersToCreate) {
                    await prisma.member.create({
                        data: user,
                    });
                    logger.info(`dummy user created: ${user.userId}`);
                }
            }
        } catch (error) {
            await sendErrorLogs(logger, error);
        }
    }
}
