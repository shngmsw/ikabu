import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { assertExistCheck } from '../../common/others';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function showVariables(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    try {
        const env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        await interaction.deleteReply();
        assertExistCheck(interaction.channel, 'channel');
        await interaction.channel?.send({
            content: '今の環境変数設定を表示するでし！',
            files: [env_file],
        });
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
