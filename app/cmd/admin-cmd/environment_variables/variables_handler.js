const { PermissionsBitField } = require('discord.js');
const { isEmpty } = require('../../../common');
const { deleteVariables } = require('./delete_variables');
const { setVariables } = require('./set_variables');
const { showVariables } = require('./show_variables');
const { searchChannelById } = require('../../../manager/channelManager');

module.exports = {
    variablesHandler: variablesHandler,
};

async function variablesHandler(interaction) {
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.editReply({ content: 'チャンネルを管理する権限がないでし！', ephemeral: true });
    }

    if (interaction.channel.parentId != process.env.CATEGORY_PARENT_ID_ADMIN_ONLY) {
        return sendChannelError(interaction);
    }

    switch (interaction.options.getSubcommand()) {
        case '表示':
            await showVariables(interaction);
            break;
        case '登録更新':
            await setVariables(interaction);
            break;
        case '削除':
            await deleteVariables(interaction);
            break;
    }
}

async function sendChannelError(interaction) {
    const env_channel_id = process.env.CATEGORY_PARENT_ID_ADMIN_ONLY;
    if (isEmpty(env_channel_id)) {
        // .envに記載がない場合
        await interaction.editReply({
            content: '`CATEGORY_PARENT_ID_ADMIN_ONLY`が正しく設定されているか確認するでし！',
            ephemeral: true,
        });
    } else {
        // .envに記載がある場合
        const env_channel = await searchChannelById(interaction.guild, env_channel_id);
        if (isEmpty(env_channel)) {
            // .envのカテゴリIDが間違っている場合
            await interaction.editReply({
                content: '`CATEGORY_PARENT_ID_ADMIN_ONLY`が正しく設定されているか確認するでし！',
                ephemeral: true,
            });
        } else {
            // .envで指定されたカテゴリと一致しない場合
            await interaction.editReply({
                content: 'このカテゴリでは使えないでし！',
                ephemeral: true,
            });
        }
    }
}
