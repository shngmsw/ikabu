const { MessageActionRow, MessageButton } = require('discord.js');
const { URLSearchParams } = require('url');

module.exports = {
    recruitDeleteButton: recruitDeleteButton,
    recruitActionRow: recruitActionRow,
    disableButtons: disableButtons,
};

function recruitDeleteButton(msg, host_user) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);
    joinParams.append('hid', host_user.id);

    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('cid', msg.channel.id);
    deleteParams.append('hid', host_user.id);

    let button = new MessageActionRow();
    button.addComponents([
        new MessageButton().setCustomId(joinParams.toString()).setLabel('参加').setStyle('PRIMARY'),
        new MessageButton().setCustomId(deleteParams.toString()).setLabel('削除').setStyle('DANGER'),
    ]);
    return button;
}

function recruitActionRow(msg, host_user) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);
    joinParams.append('hid', host_user.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('mid', msg.id);
    cancelParams.append('cid', msg.channel.id);
    cancelParams.append('hid', host_user.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('mid', msg.id);
    closeParams.append('cid', msg.channel.id);
    closeParams.append('hid', host_user.id);

    return new MessageActionRow().addComponents([
        new MessageButton().setCustomId(joinParams.toString()).setLabel('参加').setStyle('PRIMARY'),
        new MessageButton().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle('DANGER'),
        new MessageButton().setCustomId(closeParams.toString()).setLabel('〆').setStyle('SECONDARY'),
    ]);
}
function disableButtons() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('join').setLabel('参加').setStyle('PRIMARY').setDisabled(),
        new MessageButton().setCustomId('cancel').setLabel('キャンセル').setStyle('DANGER').setDisabled(),
        new MessageButton().setCustomId('close').setLabel('〆').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}
