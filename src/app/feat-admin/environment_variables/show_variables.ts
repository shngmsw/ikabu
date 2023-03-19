// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Attachment... Remove this comment to see the full error message
const { AttachmentBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    showVariables: showVariables,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('interaction');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'showVariab... Remove this comment to see the full error message
async function showVariables(interaction: $TSFixMe) {
    try {
        // @ts-expect-error TS(2304): Cannot find name 'env_file'.
        env_file = new AttachmentBuilder('./.env', { name: 'env.txt' });

        // @ts-expect-error TS(2304): Cannot find name 'env_file'.
        await interaction.editReply({ content: '今の環境変数設定を表示するでし！', files: [env_file] });
    } catch (error) {
        logger.error(error);
    }
}
