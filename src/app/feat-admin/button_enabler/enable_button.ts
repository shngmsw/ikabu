import { MessageContextMenuCommandInteraction, PermissionsBitField } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { setButtonEnable } from '../../common/button_components';
import { isEmpty } from '../../common/others';

export async function buttonEnable(interaction: MessageContextMenuCommandInteraction<CacheType>) {
    const logger = log4js_obj.getLogger('interaction');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.reply({
            content: '操作を実行する権限がないでし！',
            ephemeral: true,
        });
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

        await message.edit({ components: setButtonEnable(message) });

        await interaction.editReply({
            content: 'ボタンを有効化したでし！\n最後に押されたボタンが考え中になっていても通常の処理は行われるはずでし！',
        });
    } catch (error) {
        logger.error(error);
        interaction.channel.send('なんかエラー出てるわ');
    }
}
