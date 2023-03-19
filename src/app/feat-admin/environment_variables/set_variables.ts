// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Attachment... Remove this comment to see the full error message
const { AttachmentBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs').promises;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ENV_FILE_P... Remove this comment to see the full error message
const ENV_FILE_PATH = path.resolve('./', '.env');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    setVariables: setVariables,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('interaction');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setVariabl... Remove this comment to see the full error message
async function setVariables(interaction: $TSFixMe) {
    try {
        const options = interaction.options;
        const key = options.getString('key');
        const value = options.getString('value');

        // .envファイル更新
        await setEnvValue(key, value);

        // @ts-expect-error TS(2304): Cannot find name 'env_file'.
        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        // dotenv更新 (override trueにしないと上書きされない)
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        require('dotenv').config({ override: true });

        // @ts-expect-error TS(2304): Cannot find name 'env_file'.
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
async function setEnvValue(key: $TSFixMe, value: $TSFixMe) {
    try {
        const envFile = await fs.readFile(ENV_FILE_PATH, 'utf-8');
        const envVars = envFile.split(/\r\n|\n|\r/);
        const targetLine = envVars.find((line: $TSFixMe) => line.split('=')[0] === key);
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
