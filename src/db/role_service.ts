import { ColorResolvable } from 'discord.js';

import { prisma } from './prisma';
import { sendErrorLogs } from '../app/logs/error/send_error_logs';
import { log4js_obj } from '../log4js_settings';

const logger = log4js_obj.getLogger('database');

export class RoleService {
    static async save(
        guildId: string,
        roleId: string,
        roleName: string,
        color: ColorResolvable,
        position: number,
    ) {
        try {
            return await prisma.role.upsert({
                where: {
                    guildId_roleId: {
                        guildId: guildId,
                        roleId: roleId,
                    },
                },
                update: {
                    name: roleName,
                    mention: `<@&${roleId}>`,
                    hexColor: color.toString(),
                    position: position,
                },
                create: {
                    guildId: guildId,
                    roleId: roleId,
                    name: roleName,
                    mention: `<@&${roleId}>`,
                    hexColor: color.toString(),
                    position: position,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async delete(guildId: string, roleId: string) {
        try {
            return await prisma.role.delete({
                where: {
                    guildId_roleId: {
                        guildId: guildId,
                        roleId: roleId,
                    },
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getRole(guildId: string, roleId: string) {
        try {
            return await prisma.role.findUnique({
                where: {
                    guildId_roleId: {
                        guildId: guildId,
                        roleId: roleId,
                    },
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getAllGuildRoles(guildId: string) {
        try {
            return await prisma.role.findMany({
                where: {
                    guildId: guildId,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return [];
        }
    }

    static async getAllRoles() {
        try {
            return await prisma.role.findMany();
        } catch (error) {
            await sendErrorLogs(logger, error);
            return [];
        }
    }
}
