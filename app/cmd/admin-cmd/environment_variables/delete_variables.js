const { AttachmentBuilder } = require('discord.js');
const log4js = require('log4js');
const fs = require('fs').promises;
const path = require('path');

const ENV_FILE_PATH = path.resolve('./', '.env');

module.exports = {
    deleteVariables: deleteVariables,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('interaction');

async function deleteVariables(interaction) {
    try {
        const options = interaction.options;
        const key = options.getString('key');

        // .envファイル更新
        const success = await deleteEnvValue(key);

        if (!success) {
            return await interaction.editReply({ content: '削除に失敗したでし！\n`' + key + '`で間違いないか確認するでし！' });
        }

        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        // 現在のprocess.env更新 (process.envは消せないので空文字で上書きすることで対応)
        process.env[key] = '';
        await interaction.editReply({
            content: '削除したでし！\n挙動がおかしくなる場合があるので再起動を推奨するでし！',
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
async function deleteEnvValue(key) {
    try {
        const envFile = await fs.readFile(ENV_FILE_PATH, 'utf-8');
        // 複数の改行コードに対応
        const envVars = envFile.split(/\r\n|\n|\r/);
        const targetLine = envVars.find((line) => line.split('=')[0] === key);
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
