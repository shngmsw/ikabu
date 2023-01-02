const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { URLSearchParams } = require('url');
const { isNotEmpty } = require('../common');

module.exports = {
    setButtonEnable: setButtonEnable,
    recoveryThinkingButton: recoveryThinkingButton,
    disableThinkingButton: disableThinkingButton,
    setButtonDisable: setButtonDisable,
};

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
