import {
    ActionRowBuilder,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

export async function createRegularModal(interaction: ButtonInteraction<'cached' | 'raw'>) {
    const modalParams = new URLSearchParams();
    modalParams.append('recm', 'regrec');

    const modal = new ModalBuilder()
        .setCustomId(modalParams.toString())
        .setTitle('ナワバリ募集を作成');

    const recruitNumInput = new TextInputBuilder()
        .setCustomId('rNum')
        .setLabel('募集人数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 5')
        .setMaxLength(1)
        .setRequired(true);

    const conditionInput = new TextInputBuilder()
        .setCustomId('condition')
        .setLabel('参加条件')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例: 21時まで えんじょい！')
        .setMaxLength(120)
        .setRequired(true);

    const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(recruitNumInput);
    const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(conditionInput);

    modal.addComponents(actionRow1, actionRow2);

    await interaction.showModal(modal);
}
