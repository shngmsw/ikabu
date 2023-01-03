const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    handleCreateModal: handleCreateModal,
};

async function handleCreateModal(interaction, params) {
    const channelName = params.get('cn');
    switch (channelName) {
        case 'リグマ募集':
        case 'リグマ募集2':
        case '🔰リグマ募集':
            // リグマ実装時に作る
            break;
        case 'ナワバリ募集':
            await createRegularModal(interaction);
            break;
        case 'バンカラ募集':
            await createAnarchyModal(interaction);
            break;
        case 'フウカ募集':
        case 'ウツホ募集':
        case 'マンタロー募集':
            await createFesModal(interaction, channelName);
            break;
        case 'サーモン募集':
            await createSalmonModal(interaction);
            break;

        default:
            break;
    }
}

async function createRegularModal(interaction) {
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

async function createAnarchyModal(interaction) {
    const modalParams = new URLSearchParams();
    modalParams.append('recm', 'anarec');

    const modal = new ModalBuilder().setCustomId(modalParams.toString()).setTitle('バンカラ募集を作成');

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
        .setPlaceholder('例: ブキチ#3671 ←この形式で入力すればアイコンが表示されます。')
        .setRequired(false);

    const participant2 = new TextInputBuilder()
        .setCustomId('participant2')
        .setLabel('参加者数が「2」の場合、あなた以外の参加者名(2人目)を入力')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: スパイキー#1234 ←この形式で入力すればアイコンが表示されます。')
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
    const actionRow3 = new ActionRowBuilder().addComponents(participant1);
    const actionRow4 = new ActionRowBuilder().addComponents(participant2);
    const actionRow5 = new ActionRowBuilder().addComponents(conditionInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);

    await interaction.showModal(modal);
}

async function createFesModal(interaction, channelName) {
    const modalParams = new URLSearchParams();
    modalParams.append('recm', 'fesrec');
    modalParams.append('cn', channelName);

    const modal = new ModalBuilder().setCustomId(modalParams.toString()).setTitle(channelName + 'を作成');

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
        .setPlaceholder('例: ブキチ#3671 ←この形式で入力すればアイコンが表示されます。')
        .setRequired(false);

    const participant2 = new TextInputBuilder()
        .setCustomId('participant2')
        .setLabel('参加者数が「2」の場合、あなた以外の参加者名(2人目)を入力')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: スパイキー#1234 ←この形式で入力すればアイコンが表示されます。')
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
    const actionRow3 = new ActionRowBuilder().addComponents(participant1);
    const actionRow4 = new ActionRowBuilder().addComponents(participant2);
    const actionRow5 = new ActionRowBuilder().addComponents(conditionInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);

    await interaction.showModal(modal);
}

async function createSalmonModal(interaction) {
    const modalParams = new URLSearchParams();
    modalParams.append('recm', 'salrec');

    const modal = new ModalBuilder().setCustomId(modalParams.toString()).setTitle('サーモン募集を作成');

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
        .setPlaceholder('例: ブキチ#3671 ←この形式で入力すればアイコンが表示されます。')
        .setRequired(false);

    const participant2 = new TextInputBuilder()
        .setCustomId('participant2')
        .setLabel('参加者数が「2」の場合、あなた以外の参加者名(2人目)を入力')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: スパイキー#1234 ←この形式で入力すればアイコンが表示されます。')
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
    const actionRow3 = new ActionRowBuilder().addComponents(participant1);
    const actionRow4 = new ActionRowBuilder().addComponents(participant2);
    const actionRow5 = new ActionRowBuilder().addComponents(conditionInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);

    await interaction.showModal(modal);
}
