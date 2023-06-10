import {
    ActionRow,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonComponent,
    ButtonInteraction,
    CacheType,
    ComponentType,
    Message,
    MessageActionRowComponent,
} from 'discord.js';

import { assertExistCheck, exists } from './others';

/**
 * 考え中ボタンのラベルを更新してボタンを有効化する
 * @param {*} interaction ボタンを押したときのinteraction
 * @param {*} label 押されたボタンに割り当て直すラベル
 * @returns 新しいActionRowオブジェクト
 */
export function recoveryThinkingButton(interaction: ButtonInteraction<CacheType>, label: string) {
    const message = interaction.message;
    const newActionRow = message.components.map((oldActionRow: ActionRow<MessageActionRowComponent>) => {
        const updatedActionRow = new ActionRowBuilder<ButtonBuilder>();

        updatedActionRow.addComponents(
            oldActionRow.components
                .filter<ButtonComponent>((value): value is ButtonComponent => value.type === ComponentType.Button)
                .map((buttonComponent: ButtonComponent) => {
                    if (interaction.customId === buttonComponent.customId) {
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
export function disableThinkingButton(interaction: ButtonInteraction<CacheType>, label: string) {
    const message = interaction.message;
    const newActionRow = message.components.map((oldActionRow: ActionRow<MessageActionRowComponent>) => {
        const updatedActionRow = new ActionRowBuilder<ButtonBuilder>();

        updatedActionRow.addComponents(
            oldActionRow.components
                .filter<ButtonComponent>((value): value is ButtonComponent => value.type === ComponentType.Button)
                .map((buttonComponent: ButtonComponent) => {
                    if (interaction.customId === buttonComponent.customId) {
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
export function setButtonEnable(message: Message) {
    const newActionRow = message.components.map((oldActionRow: ActionRow<MessageActionRowComponent>) => {
        const updatedActionRow = new ActionRowBuilder<ButtonBuilder>();

        updatedActionRow.addComponents(
            oldActionRow.components
                .filter<ButtonComponent>((value): value is ButtonComponent => value.type === ComponentType.Button)
                .map((buttonComponent: ButtonComponent) => {
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
export function setButtonDisable(message: Message, interaction?: ButtonInteraction<CacheType>) {
    const newActionRow = message.components.map((oldActionRow: ActionRow<MessageActionRowComponent>) => {
        const updatedActionRow = new ActionRowBuilder<ButtonBuilder>();

        updatedActionRow.addComponents(
            oldActionRow.components
                .filter<ButtonComponent>((value): value is ButtonComponent => value.type === ComponentType.Button)
                .map((buttonComponent: ButtonComponent) => {
                    let newButton;
                    if (exists(interaction) && interaction.customId === buttonComponent.customId) {
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
