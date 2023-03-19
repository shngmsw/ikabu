// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Permission... Remove this comment to see the full error message
const { PermissionsBitField } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
const { isEmpty } = require('../../common/others');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'deleteVari... Remove this comment to see the full error message
const { deleteVariables } = require('./delete_variables');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setVariabl... Remove this comment to see the full error message
const { setVariables } = require('./set_variables');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'showVariab... Remove this comment to see the full error message
const { showVariables } = require('./show_variables');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchChan... Remove this comment to see the full error message
const { searchChannelById } = require('../../common/manager/channel_manager');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    variablesHandler: variablesHandler,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'variablesH... Remove this comment to see the full error message
async function variablesHandler(interaction: $TSFixMe) {
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.editReply({ content: 'チャンネルを管理する権限がないでし！', ephemeral: true });
    }

    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
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

async function sendChannelError(interaction: $TSFixMe) {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
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
