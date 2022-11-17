const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { URLSearchParams } = require('url');
const { isNotEmpty } = require('../common');

module.exports = {
    recruitDeleteButton: recruitDeleteButton,
    recruitActionRow: recruitActionRow,
    unlockChannelButton: unlockChannelButton,
    notifyActionRow: notifyActionRow,
    setButtonEnable: setButtonEnable,
    recoveryThinkingButton: recoveryThinkingButton,
    disableThinkingButton: disableThinkingButton,
    setButtonDisable: setButtonDisable,
};

function recruitDeleteButton(msg, header, channel_id = null) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('hmid', header.id);
    if (isNotEmpty(channel_id)) {
        deleteParams.append('vid', channel_id);
    }

    let button = new ActionRowBuilder();
    button.addComponents([new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('募集を削除').setStyle(ButtonStyle.Danger)]);
    return button;
}

function recruitActionRow(header, channel_id = null) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('hmid', header.id);
    if (isNotEmpty(channel_id)) {
        joinParams.append('vid', channel_id);
    }

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('hmid', header.id);
    if (isNotEmpty(channel_id)) {
        cancelParams.append('vid', channel_id);
    }

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('hmid', header.id);
    if (isNotEmpty(channel_id)) {
        closeParams.append('vid', channel_id);
    }

    return new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

function notifyActionRow(host_id) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'njr');
    joinParams.append('hid', host_id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'ncr');
    cancelParams.append('hid', host_id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'nclose');
    closeParams.append('hid', host_id);

    return new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

function unlockChannelButton(channel_id) {
    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'unl');
    buttonParams.append('vid', channel_id);

    let button = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(buttonParams.toString()).setLabel('ボイスチャンネルのロック解除').setStyle(ButtonStyle.Secondary),
    ]);
    return button;
}

/**
 * 考え中ボタンのラベルを更新してボタンを有効化する
 * @param {*} interaction ボタンを押したときのinteraction
 * @param {*} label 押されたボタンに割り当て直すラベル
 * @returns 新しいActionRowオブジェクト
 */
async function recoveryThinkingButton(interaction, label) {
    const message = interaction.message;
    let newActionRow = await message.components.map((oldActionRow) => {
        //create a new action row to add the new data
        updatedActionRow = new ActionRowBuilder();

        // Loop through old action row components (which are buttons in this case)
        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent) => {
                if (interaction.component.customId == buttonComponent.customId) {
                    newButton = new ButtonBuilder();
                    newButton.setLabel(label);
                    newButton.setCustomId(buttonComponent.customId);
                    newButton.setStyle(buttonComponent.style);
                    newButton.setDisabled(false);
                } else {
                    newButton = ButtonBuilder.from(buttonComponent);
                    newButton.setDisabled(false);
                }
                return newButton;
            }),
        );
        return updatedActionRow;
    });
    return newActionRow;
}

/**
 * 考え中ボタンのラベルを更新してボタンを無効化する
 * @param {*} interaction ボタンを押したときのinteraction
 * @param {*} label 押されたボタンに割り当て直すラベル
 * @returns 新しいActionRowオブジェクト
 */
async function disableThinkingButton(interaction, label) {
    const message = interaction.message;
    let newActionRow = await message.components.map((oldActionRow) => {
        //create a new action row to add the new data
        updatedActionRow = new ActionRowBuilder();

        // Loop through old action row components (which are buttons in this case)
        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent) => {
                if (interaction.component.customId == buttonComponent.customId) {
                    newButton = new ButtonBuilder();
                    newButton.setLabel(label);
                    newButton.setCustomId(buttonComponent.customId);
                    newButton.setStyle(buttonComponent.style);
                    newButton.setDisabled(true);
                } else {
                    newButton = ButtonBuilder.from(buttonComponent);
                    newButton.setDisabled(true);
                }
                return newButton;
            }),
        );
        return updatedActionRow;
    });
    return newActionRow;
}

/**
 * メッセージに含まれる全てのButtonComponentsを有効化する
 * @param {*} message ボタンが含まれるmessageオブジェクト
 * @returns 新しいActionRowオブジェクト
 */
async function setButtonEnable(message) {
    let newActionRow = await message.components.map((oldActionRow) => {
        //create a new action row to add the new data
        updatedActionRow = new ActionRowBuilder();

        // Loop through old action row components (which are buttons in this case)
        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent) => {
                //create a new button from the old button, to change it if necessary
                newButton = ButtonBuilder.from(buttonComponent);

                newButton.setDisabled(false);

                return newButton;
            }),
        );
        return updatedActionRow;
    });
    return newActionRow;
}

/**
 * ButtonComponentsを無効化する
 * @param {*} message ボタンが含まれるmessageオブジェクト
 * @param {*} interaction 考え中にする場合押されたボタンのインタラクション
 * @returns 新しいActionRowオブジェクト
 */
async function setButtonDisable(message, interaction = null) {
    let newActionRow = await message.components.map((oldActionRow) => {
        //create a new action row to add the new data
        updatedActionRow = new ActionRowBuilder();

        // Loop through old action row components (which are buttons in this case)
        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent) => {
                //create a new button from the old button, to change it if necessary

                //if this was the button that was clicked, this is the one to change!
                if (isNotEmpty(interaction) && interaction.component.customId == buttonComponent.customId) {
                    newButton = new ButtonBuilder();
                    newButton.setStyle(buttonComponent.style);
                    newButton.setCustomId(buttonComponent.customId);
                    newButton.setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID);
                    newButton.setDisabled(true);
                } else {
                    newButton = ButtonBuilder.from(buttonComponent);
                    newButton.setDisabled(true);
                }
                return newButton;
            }),
        );
        return updatedActionRow;
    });
    return newActionRow;
}
