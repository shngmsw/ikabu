import { URLSearchParams } from 'url';

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';

import { exists } from '../../common/others';

export function recruitDeleteButton(
    message: Message<true>,
    image1Message: Message<true>,
    image2Message: Message<true>,
) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', message.id);
    deleteParams.append('imid1', image1Message.id);
    deleteParams.append('imid2', image2Message.id);

    const button = new ActionRowBuilder<ButtonBuilder>();
    button.addComponents([
        new ButtonBuilder()
            .setCustomId(deleteParams.toString())
            .setLabel('募集を削除')
            .setStyle(ButtonStyle.Danger),
    ]);
    return button;
}

export function embedRecruitDeleteButton(message: Message<true>, header: Message<true>) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', message.id);
    deleteParams.append('imid1', header.id);

    const button = new ActionRowBuilder<ButtonBuilder>();
    button.addComponents([
        new ButtonBuilder()
            .setCustomId(deleteParams.toString())
            .setLabel('募集を削除')
            .setStyle(ButtonStyle.Danger),
    ]);
    return button;
}

export function recruitActionRow(imageMessage: Message<true>, channelId?: string) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('imid1', imageMessage.id);
    if (exists(channelId)) {
        joinParams.append('vid', channelId);
    }

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('imid1', imageMessage.id);
    if (exists(channelId)) {
        cancelParams.append('vid', channelId);
    }

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('imid1', imageMessage.id);
    if (exists(channelId)) {
        closeParams.append('vid', channelId);
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId(joinParams.toString())
            .setLabel('参加')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(cancelParams.toString())
            .setLabel('キャンセル')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(closeParams.toString())
            .setLabel('〆')
            .setStyle(ButtonStyle.Secondary),
    ]);
}

export function notifyActionRow() {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'njr');

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'ncr');

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'nclose');

    return new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId(joinParams.toString())
            .setLabel('参加')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(cancelParams.toString())
            .setLabel('キャンセル')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(closeParams.toString())
            .setLabel('〆')
            .setStyle(ButtonStyle.Secondary),
    ]);
}

export function unlockChannelButton(channelId: string) {
    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'unl');
    buttonParams.append('vid', channelId);

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setCustomId(buttonParams.toString())
            .setLabel('ボイスチャンネルのロック解除')
            .setStyle(ButtonStyle.Secondary),
    ]);
    return button;
}

export function createNewRecruitButton(channelName: string) {
    const allowedChannel = [
        'ナワバリ募集',
        'バンカラ募集',
        'イベマ募集',
        'サーモン募集',
        'ウツホ募集',
        'フウカ募集',
        'マンタロー募集',
    ];

    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'newr');
    buttonParams.append('cn', channelName);
    const button = new ActionRowBuilder<ButtonBuilder>();
    if (allowedChannel.includes(channelName)) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(buttonParams.toString())
                .setLabel('簡易' + channelName + 'をする')
                .setStyle(ButtonStyle.Success),
        ]);
    }
    if (exists(process.env.HOW_TO_RECRUIT_URL)) {
        button.addComponents([
            new ButtonBuilder()
                .setURL(process.env.HOW_TO_RECRUIT_URL)
                .setLabel('募集方法を確認')
                .setStyle(ButtonStyle.Link),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder()
                .setLabel('✗ 募集方法を確認')
                .setCustomId('dummy')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
        ]);
    }

    return button;
}

export function nsoRoomLinkButton(url: string) {
    const button = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setLabel('ヘヤタテ機能を使用して参加')
            .setStyle(ButtonStyle.Link)
            .setURL(url),
    ]);
    return button;
}

export function channelLinkButtons(guildId: string, channelId: string) {
    const channelLink = `https://discord.com/channels/${guildId}/${channelId}`;
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setLabel('チャンネルに移動')
            .setStyle(ButtonStyle.Link)
            .setURL(channelLink),
    ]);
    return buttons;
}

export function messageLinkButtons(
    guildId: string,
    channelId: string,
    messageId: string,
    label = 'メッセージを表示',
) {
    const link = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(link),
    ]);
    return buttons;
}
