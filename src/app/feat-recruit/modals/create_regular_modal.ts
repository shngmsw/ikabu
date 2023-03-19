// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ActionRowB... Remove this comment to see the full error message
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    createRegularModal: createRegularModal,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createRegu... Remove this comment to see the full error message
async function createRegularModal(interaction: $TSFixMe) {
    const modalParams = new URLSearchParams();
    modalParams.append('recm', 'regrec');

    const modal = new ModalBuilder().setCustomId(modalParams.toString()).setTitle('ナワバリ募集を作成');

    const recruitNumInput = new TextInputBuilder()
        .setCustomId('rNum')
        .setLabel('募集人数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 5')
        .setMaxLength(1)
        .setRequired(true);

    const participantsNumInput = new TextInputBuilder()
        .setCustomId('pNum')
        .setLabel('既にいる参加者の数 (あなたを除く)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 2')
        .setMaxLength(1)
        .setRequired(true);

    const participantsList = new TextInputBuilder()
        .setCustomId('pList')
        .setLabel('あなた以外の参加者名を入力')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: ブキチ, スパイキー')
        .setRequired(false);

    const conditionInput = new TextInputBuilder()
        .setCustomId('condition')
        .setLabel('参加条件')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例: 21時まで えんじょい！')
        .setMaxLength(120)
        .setRequired(true);

    const actionRow1 = new ActionRowBuilder().addComponents(recruitNumInput);
    const actionRow2 = new ActionRowBuilder().addComponents(participantsNumInput);
    const actionRow3 = new ActionRowBuilder().addComponents(participantsList);
    const actionRow4 = new ActionRowBuilder().addComponents(conditionInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

    await interaction.showModal(modal);
}
