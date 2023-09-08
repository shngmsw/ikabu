import { prisma } from './prisma';
import { notExists } from '../app/common/others';
import { ObjectValueList } from '../app/constant/constant_common';
import { sendErrorLogs } from '../app/logs/error/send_error_logs';
import { log4js_obj } from '../log4js_settings';

const logger = log4js_obj.getLogger('database');

export const ChannelKey = {
    Lobby: 'CHANNEL_ID_LOBBY',
    Description: 'CHANNEL_ID_DESCRIPTION',
    Introduction: 'CHANNEL_ID_INTRODUCTION',
    Rule: 'CHANNEL_ID_RULE',
    BotCommand: 'CHANNEL_ID_BOT_COMMAND',
    StageInfo: 'CHANNEL_ID_STAGE_INFO',
    RecruitHelp: 'CHANNEL_ID_RECRUIT_HELP',
    SupportCenter: 'CHANNEL_ID_SUPPORT_CENTER',
    ErrorLog: 'CHANNEL_ID_ERROR_LOG',
    MessageLog: 'CHANNEL_ID_MESSAGE_LOG',
    RetireLog: 'CHANNEL_ID_RETIRE_LOG',
    ButtonLog: 'CHANNEL_ID_BUTTON_LOG',
    CommandLog: 'CHANNEL_ID_COMMAND_LOG',
    PrivateRecruit: 'CHANNEL_ID_RECRUIT_PRIVATE',
    RegularRecruit: 'CHANNEL_ID_RECRUIT_REGULAR',
    AnarchyRecruit: 'CHANNEL_ID_RECRUIT_ANARCHY',
    EventRecruit: 'CHANNEL_ID_RECRUIT_EVENT',
    SalmonRecruit: 'CHANNEL_ID_RECRUIT_SALMON',
    FestivalCategory: 'CATEGORY_ID_FESTIVAL',
    FryeRecruit: 'CHANNEL_ID_RECRUIT_FRYE',
    ShiverRecruit: 'CHANNEL_ID_RECRUIT_SHIVER',
    BigmanRecruit: 'CHANNEL_ID_RECRUIT_BIGMAN',
    OtherGamesRecruit: 'CHANNEL_ID_RECRUIT_OTHER_GAMES',
} as const;
export type ChannelKey = ObjectValueList<typeof ChannelKey>;
export function isChannelKey(value: string): value is ChannelKey {
    return Object.values(ChannelKey).some((v) => v === value);
}

export class UniqueChannelService {
    static async register(guildId: string, key: ChannelKey, channelId: string) {
        try {
            return await prisma.uniqueChannel.upsert({
                where: {
                    guildId_key: {
                        guildId: guildId,
                        key: key,
                    },
                },
                update: {
                    guildId: guildId,
                    channelId: channelId,
                },
                create: {
                    guildId: guildId,
                    channelId: channelId,
                    key: key,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getChannelId(guildId: string, key: ChannelKey) {
        try {
            const result = await prisma.uniqueChannel.findUnique({
                where: {
                    guildId_key: {
                        guildId: guildId,
                        key: key,
                    },
                },
            });
            if (notExists(result)) return null;
            return result.channelId;
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async getAllUniqueChannels(guildId: string) {
        try {
            const results = await prisma.uniqueChannel.findMany({
                where: {
                    guildId: guildId,
                },
            });

            // ChannelKeyの型を保証するために、新しく配列を作り直す
            const filteredResults: { guildId: string; key: ChannelKey; channelId: string }[] = [];

            for (const result of results) {
                if (isChannelKey(result.key)) {
                    // ChannelKeyの値が正しいかどうかのチェック
                    filteredResults.push({
                        guildId: result.guildId,
                        key: result.key,
                        channelId: result.channelId,
                    });
                } else {
                    throw new Error(`Invalid ChannelKey: ${result.key}`);
                }
            }

            return filteredResults;
        } catch (error) {
            await sendErrorLogs(logger, error);
            return [];
        }
    }

    static async delete(guildId: string, key: ChannelKey) {
        try {
            return await prisma.uniqueChannel.delete({
                where: {
                    guildId_key: {
                        guildId: guildId,
                        key: key,
                    },
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }

    static async setUniqueChannel(guildId: string, key: ChannelKey, channelId: string) {
        try {
            return await prisma.uniqueChannel.update({
                where: {
                    guildId_key: {
                        guildId: guildId,
                        key: key,
                    },
                },
                data: {
                    channelId: channelId,
                },
            });
        } catch (error) {
            await sendErrorLogs(logger, error);
            return null;
        }
    }
}
