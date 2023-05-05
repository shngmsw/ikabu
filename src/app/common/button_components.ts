import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { assertExistCheck, isNotEmpty } from './others';

/**
 * 考え中ボタンのラベルを更新してボタンを有効化する
 * @param {*} interaction ボタンを押したときのinteraction
 * @param {*} label 押されたボタンに割り当て直すラベル
 * @returns 新しいActionRowオブジェクト
 */
export async function recoveryThinkingButton(interaction: $TSFixMe, label: $TSFixMe) {
    const message = interaction.message;
    const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
        const updatedActionRow = new ActionRowBuilder();

        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent: $TSFixMe) => {
                if (interaction.component.customId == buttonComponent.customId) {
                    const newButton = new ButtonBuilder();
                    newButton.setLabel(label);
                    newButton.setCustomId(buttonComponent.customId);
                    newButton.setStyle(buttonComponent.style);
                    newButton.setDisabled(false);
                    return newButton;
                } else {
                    const newButton = ButtonBuilder.from(buttonComponent);
                    newButton.setDisabled(false);
                    return newButton;
                }
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
export async function disableThinkingButton(interaction: $TSFixMe, label: $TSFixMe) {
    const message = interaction.message;
    const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
        const updatedActionRow = new ActionRowBuilder();

        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent: $TSFixMe) => {
                if (interaction.component.customId == buttonComponent.customId) {
                    const newButton = new ButtonBuilder();
                    newButton.setLabel(label);
                    newButton.setCustomId(buttonComponent.customId);
                    newButton.setStyle(buttonComponent.style);
                    newButton.setDisabled(true);
                    return newButton;
                } else {
                    const newButton = ButtonBuilder.from(buttonComponent);
                    newButton.setDisabled(true);
                    return newButton;
                }
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
export async function setButtonEnable(message: $TSFixMe) {
    const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
        const updatedActionRow = new ActionRowBuilder();

        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent: $TSFixMe) => {
                const newButton = ButtonBuilder.from(buttonComponent);
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
export async function setButtonDisable(message: $TSFixMe, interaction?: $TSFixMe) {
    const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
        const updatedActionRow = new ActionRowBuilder();

        updatedActionRow.addComponents(
            oldActionRow.components.map((buttonComponent: $TSFixMe) => {
                let newButton;
                if (isNotEmpty(interaction) && interaction.component.customId == buttonComponent.customId) {
                    assertExistCheck(process.env.RECRUIT_LOADING_EMOJI_ID);
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
