const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const log4js = require('log4js');
const os = require('os');
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
        await interaction.deferReply();
        const options = interaction.options;
        const key = options.getString('key');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return await interaction.editReply({ content: 'チャンネルを管理する権限がないでし！', ephemeral: true });
        }

        // .envファイル更新
        const success = await deleteEnvValue(key);

        if (!success) {
            return await interaction.editReply({ content: '削除に失敗したでし！\n`' + key + '`で間違いないか確認するでし！' });
        }

        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        // 現在のprocess.env更新
        process.env[key] = undefined;

        await interaction.editReply({ content: '削除したでし！', files: [env_file] });
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
        const envVars = envFile.split(/\r\n|\n/);
        const targetLine = envVars.find((line) => line.split('=')[0] === key);
        if (targetLine !== undefined) {
            const targetLineIndex = envVars.indexOf(targetLine);
            // keyとvalueを置き換え
            envVars.splice(targetLineIndex, 1);
            // ファイル書き込み (os標準の改行コードで保存)
            await fs.writeFile(ENV_FILE_PATH, envVars.join(os.EOL));
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logger.error(error);
    }
}
