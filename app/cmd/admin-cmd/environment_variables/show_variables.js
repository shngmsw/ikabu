const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const log4js = require('log4js');

module.exports = {
    showVariables: showVariables,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('interaction');

async function showVariables(interaction) {
    try {
        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return await interaction.editReply({ content: 'チャンネルを管理する権限がないでし！', ephemeral: true });
        }

        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        await interaction.editReply({ content: '今の環境変数設定を表示するでし！', files: [env_file] });
    } catch (error) {
        logger.error(error);
    }
}
