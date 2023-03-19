const { AttachmentBuilder } = require('discord.js');
const log4js = require('log4js');
const fs = require('fs').promises;
const path = require('path');

const ENV_FILE_PATH = path.resolve('./', '.env');

module.exports = {
    setVariables: setVariables,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('interaction');

async function setVariables(interaction) {
    try {
        const options = interaction.options;
        const key = options.getString('key');
        const value = options.getString('value');

        // .envファイル更新
        await setEnvValue(key, value);

        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        // dotenv更新 (override trueにしないと上書きされない)
        require('dotenv').config({ override: true });

        await interaction.editReply({ content: '設定したでし！', files: [env_file] });
    } catch (error) {
        logger.error(error);
    }
}

/**
 * 既存のkeyの値を更新、なければ新しく「key=value」の行を作成
 * @param {string} key 更新または作成するkey
 * @param {string} value 設定する値
 */
async function setEnvValue(key, value) {
    try {
        const envFile = await fs.readFile(ENV_FILE_PATH, 'utf-8');
        const envVars = envFile.split(/\r\n|\n|\r/);
        const targetLine = envVars.find((line) => line.split('=')[0] === key);
        if (targetLine !== undefined) {
            const targetLineIndex = envVars.indexOf(targetLine);
            // keyとvalueを置き換え
            envVars.splice(targetLineIndex, 1, `${key}=${value}`);
        } else {
            // 新しくkeyとvalueを設定
            envVars.push(`${key}=${value}`);
        }
        envVars.sort();
        // ファイル書き込み
        await fs.writeFile(ENV_FILE_PATH, envVars.join('\n'));
    } catch (error) {
        logger.error(error);
    }
}