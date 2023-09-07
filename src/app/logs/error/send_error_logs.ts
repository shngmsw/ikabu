import { Logger } from 'log4js';

import { client } from '../..';
import { log4js_obj } from '../../../log4js_settings';
import { assertExistCheck, notExists } from '../../common/others';

export async function sendErrorLogs(logger: Logger, error: unknown) {
    const defaultLogger = log4js_obj.getLogger('default');

    logger.error(error);

    if (!client.isReady()) return;

    const serverId = process.env.SERVER_ID;
    assertExistCheck(serverId, 'SERVER_ID');

    if (notExists(process.env.CHANNEL_ID_ERROR_LOG)) {
        return defaultLogger.warn('CHANNEL_ID_ERROR_LOG is not defined.');
    }

    try {
        const guild = await client.guilds.fetch(serverId);
        const errorLogChannel = await guild.channels.fetch(process.env.CHANNEL_ID_ERROR_LOG);

        if (notExists(errorLogChannel)) {
            return defaultLogger.warn('error log channel is not found.');
        }

        if (!errorLogChannel.isTextBased()) {
            return defaultLogger.warn('error log channel is not text based.');
        }

        if (error instanceof Error) {
            await errorLogChannel.send(
                '### エラーログ\n' + '```\n' + (error.stack ?? error) + '\n```',
            );
        }
    } catch (error) {
        defaultLogger.error(error);
    }
}
