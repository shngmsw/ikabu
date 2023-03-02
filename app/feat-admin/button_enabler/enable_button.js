const { PermissionsBitField } = require('discord.js');
const { setButtonEnable } = require('../../common/button_components');
const log4js = require('log4js');
const { isEmpty } = require('../../common/others');

module.exports = {
    buttonEnable: buttonEnable,
};

async function buttonEnable(interaction) {
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
