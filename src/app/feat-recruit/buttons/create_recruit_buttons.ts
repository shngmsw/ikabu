// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ActionRowB... Remove this comment to see the full error message
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'URLSearchP... Remove this comment to see the full error message
const { URLSearchParams } = require('url');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty } = require('../../common/others');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    recruitDeleteButton: recruitDeleteButton,
    embedRecruitDeleteButton: embedRecruitDeleteButton,
    recruitActionRow: recruitActionRow,
    notifyActionRow: notifyActionRow,
    unlockChannelButton: unlockChannelButton,
    createNewRecruitButton: createNewRecruitButton,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitDel... Remove this comment to see the full error message
function recruitDeleteButton(msg: $TSFixMe, image1_message: $TSFixMe, image2_message: $TSFixMe) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('imid1', image1_message.id);
    deleteParams.append('imid2', image2_message.id);

    let button = new ActionRowBuilder();
    button.addComponents([new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('募集を削除').setStyle(ButtonStyle.Danger)]);
    return button;
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'embedRecru... Remove this comment to see the full error message
function embedRecruitDeleteButton(msg: $TSFixMe, header: $TSFixMe) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('imid1', header.id);

    let button = new ActionRowBuilder();
    button.addComponents([new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('募集を削除').setStyle(ButtonStyle.Danger)]);
    return button;
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitAct... Remove this comment to see the full error message
function recruitActionRow(image_message: $TSFixMe, channel_id = null) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('imid1', image_message.id);
    if (isNotEmpty(channel_id)) {
        // @ts-expect-error TS(2345): Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
        joinParams.append('vid', channel_id);
    }

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('imid1', image_message.id);
    if (isNotEmpty(channel_id)) {
        // @ts-expect-error TS(2345): Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
        cancelParams.append('vid', channel_id);
    }

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('imid1', image_message.id);
    if (isNotEmpty(channel_id)) {
        // @ts-expect-error TS(2345): Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
        closeParams.append('vid', channel_id);
    }

    return new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'notifyActi... Remove this comment to see the full error message
function notifyActionRow(host_id: $TSFixMe) {
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

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'unlockChan... Remove this comment to see the full error message
function unlockChannelButton(channel_id: $TSFixMe) {
    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'unl');
    buttonParams.append('vid', channel_id);

    let button = new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId(buttonParams.toString()).setLabel('ボイスチャンネルのロック解除').setStyle(ButtonStyle.Secondary),
    ]);
    return button;
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createNewR... Remove this comment to see the full error message
function createNewRecruitButton(channelName: $TSFixMe) {
    const allowed_channel = ['ナワバリ募集', 'バンカラ募集', 'リグマ募集', 'サーモン募集', 'ウツホ募集', 'フウカ募集', 'マンタロー募集'];

    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'newr');
    buttonParams.append('cn', channelName);
    const button = new ActionRowBuilder();
    if (allowed_channel.includes(channelName)) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(buttonParams.toString())
                .setLabel('簡易' + channelName + 'をする')
                .setStyle(ButtonStyle.Success),
        ]);
    }
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    if (isNotEmpty(process.env.HOW_TO_RECRUIT_URL)) {
        button.addComponents([
            // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
            new ButtonBuilder().setURL(process.env.HOW_TO_RECRUIT_URL).setLabel('募集方法を確認').setStyle(ButtonStyle.Link),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder().setLabel('✗ 募集方法を確認').setCustomId('dummy').setStyle(ButtonStyle.Secondary).setDisabled(true),
        ]);
    }

    return button;
}
