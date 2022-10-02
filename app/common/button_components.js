const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { URLSearchParams } = require('url');

module.exports = {
    recruitDeleteButton: recruitDeleteButton,
    recruitActionRow: recruitActionRow,
    recruitDeleteButtonWithChannel: recruitDeleteButtonWithChannel,
    recruitActionRowWithChannel: recruitActionRowWithChannel,
    disableButtons: disableButtons,
    unlockChannelButton: unlockChannelButton,
    notifyActionRow: notifyActionRow,
};

function recruitDeleteButtonWithChannel(msg, channel_id, header) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('hmid', header.id);
    joinParams.append('vid', channel_id);

    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('hmid', header.id);
    deleteParams.append('vid', channel_id);

    let button = new ActionRowBuilder();
    button.addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('削除').setStyle(ButtonStyle.Danger),
    ]);
    return button;
}

function recruitActionRowWithChannel(channel_id, header) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('hmid', header.id);
    joinParams.append('vid', channel_id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('hmid', header.id);
    cancelParams.append('vid', channel_id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('hmid', header.id);
    closeParams.append('vid', channel_id);

    return new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

function recruitDeleteButton(msg, header) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('hmid', header.id);

    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('hmid', header.id);

    let button = new ActionRowBuilder();
    button.addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('削除').setStyle(ButtonStyle.Danger),
    ]);
    return button;
}

function recruitActionRow(header) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('hmid', header.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('hmid', header.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('hmid', header.id);

    return new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

function notifyActionRow(interaction) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'njr');
    joinParams.append('hid', interaction.member.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'ncr');
    cancelParams.append('hid', interaction.member.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'nclose');
    closeParams.append('hid', interaction.member.id);

    return new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

function disableButtons() {
    let buttons = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('join').setLabel('参加').setStyle(ButtonStyle.Primary).setDisabled(),
        new ButtonBuilder().setCustomId('cancel').setLabel('キャンセル').setStyle(ButtonStyle.Danger).setDisabled(),
        new ButtonBuilder().setCustomId('close').setLabel('〆').setStyle(ButtonStyle.Secondary).setDisabled(),
    ]);
    return buttons;
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
