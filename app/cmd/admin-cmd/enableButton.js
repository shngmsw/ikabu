const { setButtonEnable } = require('../../common/button_components');
const { getFullMessageObject } = require('../../manager/messageManager');
const log4js = require('log4js');

log4js.configure('config/log4js-config.json');
const logger = log4js.getLogger('interaction');

module.exports = {
    ButtonEnable: ButtonEnable,
};

async function ButtonEnable(interaction) {
    try {
        await interaction.deferReply({ ephemeral: false });

        const messageId = interaction.options.getString('メッセージid');
        const channelId = interaction.options.getChannel('チャンネル').id;
        const message = await getFullMessageObject(interaction.guild, channelId, messageId);

        await message.edit({ components: await setButtonEnable(message) });

        await interaction.editReply({
            content: 'ボタンを有効化したでし！\n最後に押されたボタンが考え中になっていても通常の処理は行われるはずでし！',
        });
    } catch (error) {
        logger.error(error);
        interaction.channel.send('なんかエラー出てるわ');
    }
}
