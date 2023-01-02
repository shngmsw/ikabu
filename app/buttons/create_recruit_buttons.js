const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { URLSearchParams } = require('url');
const { isNotEmpty } = require('../common');

module.exports = {
    recruitDeleteButton: recruitDeleteButton,
    recruitActionRow: recruitActionRow,
    notifyActionRow: notifyActionRow,
    unlockChannelButton: unlockChannelButton,
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
