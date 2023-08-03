import {
    ActionRowBuilder,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

export async function createEventModal(interaction: ButtonInteraction<'cached' | 'raw'>) {
    const modalParams = new URLSearchParams();
    modalParams.append('recm', 'everec');

    const modal = new ModalBuilder()
        .setCustomId(modalParams.toString())
        .setTitle('イベマ募集を作成');

    const recruitNumInput = new TextInputBuilder()
        .setCustomId('rNum')
        .setLabel('募集人数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 2')
        .setMaxLength(1)
        .setRequired(true);

    const participantsNumInput = new TextInputBuilder()
        .setCustomId('pNum')
        .setLabel('既にいる参加者の数 (あなたを除く)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 1')
        .setMaxLength(1)
        .setRequired(true);

    const participant1 = new TextInputBuilder()
        .setCustomId('participant1')
        .setLabel('参加者数が「1」の場合、あなた以外の参加者名(1人目)を入力')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('ユーザー名 (ユーザーIDを入力した場合はアイコンが表示されます。)')
        .setRequired(false);

    const participant2 = new TextInputBuilder()
        .setCustomId('participant2')
        .setLabel('参加者数が「2」の場合、あなた以外の参加者名(2人目)を入力')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('ユーザー名 (ユーザーIDを入力した場合はアイコンが表示されます。)')
        .setRequired(false);

    const conditionInput = new TextInputBuilder()
        .setCustomId('condition')
        .setLabel('参加条件')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例: 21時まで えんじょい！')
        .setMaxLength(120)
        .setRequired(true);

    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(recruitNumInput);
    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(participantsNumInput);
    const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(participant1);
    const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(participant2);
    const row5 = new ActionRowBuilder<TextInputBuilder>().addComponents(conditionInput);

    modal.addComponents(row1, row2, row3, row4, row5);

    await interaction.showModal(modal);
}
