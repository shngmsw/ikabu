import path from 'path';

import { AttachmentBuilder } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs').promises;

const ENV_FILE_PATH = path.resolve('./', '.env');

const logger = log4js_obj.getLogger('interaction');

export async function deleteVariables(interaction: $TSFixMe) {
    try {
        const options = interaction.options;
        const key = options.getString('key');

        // .envファイル更新
        const success = await deleteEnvValue(key);

        if (!success) {
            return await interaction.editReply({
                content: '削除に失敗したでし！\n`' + key + '`で間違いないか確認するでし！',
            });
        }

        const env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });
        // 現在のprocess.env更新 (process.envから直接削除)
        delete process.env[key];

        await interaction.editReply({
            content: '削除したでし！',
            files: [env_file],
        });
    } catch (error) {
        logger.error(error);
    }
}

/**
 * 既存のkeyを削除
 * @param {string} key 削除するkey
 * @returns 成功すればtrue, 失敗すればfalseを返す
 */
async function deleteEnvValue(key: $TSFixMe) {
    try {
        const envFile = await fs.readFile(ENV_FILE_PATH, 'utf-8');
        // 複数の改行コードに対応
        const envVars = envFile.split(/\r\n|\n|\r/);
        const targetLine = envVars.find((line: $TSFixMe) => line.split('=')[0] === key);
        if (targetLine !== undefined) {
            const targetLineIndex = envVars.indexOf(targetLine);
            // keyとvalueを置き換え
            envVars.splice(targetLineIndex, 1);
            // ファイル書き込み
            await fs.writeFile(ENV_FILE_PATH, envVars.join('\n'));
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logger.error(error);
    }
}
