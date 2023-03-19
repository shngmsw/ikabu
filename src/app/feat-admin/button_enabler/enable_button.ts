// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Permission... Remove this comment to see the full error message
const { PermissionsBitField } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setButtonE... Remove this comment to see the full error message
const { setButtonEnable } = require('../../common/button_components');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
const { isEmpty } = require('../../common/others');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    buttonEnable: buttonEnable,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'buttonEnab... Remove this comment to see the full error message
async function buttonEnable(interaction: $TSFixMe) {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    log4js.configure(process.env.LOG4JS_CONFIG_PATH);
    const logger = log4js.getLogger('interaction');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.reply({ content: '操作を実行する権限がないでし！', ephemeral: true });
    }

    try {
        await interaction.deferReply({ ephemeral: false });

        const message = interaction.targetMessage;

        if (isEmpty(message)) {
            await interaction.editReply({
                content: '該当メッセージが見つからなかったでし！',
            });
            return;
        }

        await message.edit({ components: await setButtonEnable(message) });

        await interaction.editReply({
            content: 'ボタンを有効化したでし！\n最後に押されたボタンが考え中になっていても通常の処理は行われるはずでし！',
        });
    } catch (error) {
        logger.error(error);
        interaction.channel.send('なんかエラー出てるわ');
    }
}
