const { setButtonEnable } = require('../../common/button_components');
const { searchMessageById } = require('../../manager/messageManager');
const log4js = require('log4js');
const { isNotEmpty, isEmpty } = require('../../common');

module.exports = {
    ButtonEnable: ButtonEnable,
};

async function ButtonEnable(interaction) {
    log4js.configure(process.env.LOG4JS_CONFIG_PATH);
    const logger = log4js.getLogger('interaction');

    try {
        await interaction.deferReply({ ephemeral: false });

        const messageId = interaction.options.getString('メッセージid');
        let channelId;
        if (isNotEmpty(interaction.options.getChannel('チャンネル'))) {
            channelId = interaction.options.getChannel('チャンネル').id;
        } else {
            channelId = interaction.channel.id;
        }
        const message = await searchMessageById(interaction.guild, channelId, messageId);

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
