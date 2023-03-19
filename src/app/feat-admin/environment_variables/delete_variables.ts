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
    deleteVariables: deleteVariables,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('interaction');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'deleteVari... Remove this comment to see the full error message
async function deleteVariables(interaction: $TSFixMe) {
    try {
        const options = interaction.options;
        const key = options.getString('key');

        // .envファイル更新
        const success = await deleteEnvValue(key);

        if (!success) {
            return await interaction.editReply({ content: '削除に失敗したでし！\n`' + key + '`で間違いないか確認するでし！' });
        }

        // @ts-expect-error TS(2304): Cannot find name 'env_file'.
        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        // 現在のprocess.env更新 (process.envから直接削除)
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env[key];

        await interaction.editReply({
            content: '削除したでし！',
            // @ts-expect-error TS(2304): Cannot find name 'env_file'.
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
