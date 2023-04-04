import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { URLSearchParams } from 'url';
import { isNotEmpty } from '../../common/others';

export function recruitDeleteButton(msg: Message, image1_message: Message, image2_message: Message) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('imid1', image1_message.id);
    deleteParams.append('imid2', image2_message.id);

    const button = new ActionRowBuilder<ButtonBuilder>();
    button.addComponents([new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('募集を削除').setStyle(ButtonStyle.Danger)]);
    return button;
}

export function embedRecruitDeleteButton(msg: Message, header: Message) {
    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('imid1', header.id);

    const button = new ActionRowBuilder<ButtonBuilder>();
    button.addComponents([new ButtonBuilder().setCustomId(deleteParams.toString()).setLabel('募集を削除').setStyle(ButtonStyle.Danger)]);
    return button;
}

export function recruitActionRow(image_message: Message, channel_id?: string) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('imid1', image_message.id);
    if (isNotEmpty(channel_id) && channel_id !== undefined) {
        joinParams.append('vid', channel_id);
    }

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('imid1', image_message.id);
    if (isNotEmpty(channel_id) && channel_id !== undefined) {
        cancelParams.append('vid', channel_id);
    }

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('imid1', image_message.id);
    if (isNotEmpty(channel_id) && channel_id !== undefined) {
        closeParams.append('vid', channel_id);
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

export function notifyActionRow(host_id: string) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'njr');
    joinParams.append('hid', host_id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'ncr');
    cancelParams.append('hid', host_id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'nclose');
    closeParams.append('hid', host_id);

    return new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setCustomId(joinParams.toString()).setLabel('参加').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(closeParams.toString()).setLabel('〆').setStyle(ButtonStyle.Secondary),
    ]);
}

export function unlockChannelButton(channel_id: string) {
    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'unl');
    buttonParams.append('vid', channel_id);

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setCustomId(buttonParams.toString()).setLabel('ボイスチャンネルのロック解除').setStyle(ButtonStyle.Secondary),
    ]);
    return button;
}

export function createNewRecruitButton(channelName: string) {
    const allowed_channel = ['ナワバリ募集', 'バンカラ募集', 'リグマ募集', 'サーモン募集', 'ウツホ募集', 'フウカ募集', 'マンタロー募集'];

    const buttonParams = new URLSearchParams();
    buttonParams.append('d', 'newr');
    buttonParams.append('cn', channelName);
    const button = new ActionRowBuilder<ButtonBuilder>();
    if (allowed_channel.includes(channelName)) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(buttonParams.toString())
                .setLabel('簡易' + channelName + 'をする')
                .setStyle(ButtonStyle.Success),
        ]);
    }
    if (isNotEmpty(process.env.HOW_TO_RECRUIT_URL) && process.env.HOW_TO_RECRUIT_URL !== undefined) {
        button.addComponents([
            new ButtonBuilder().setURL(process.env.HOW_TO_RECRUIT_URL).setLabel('募集方法を確認').setStyle(ButtonStyle.Link),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder().setLabel('✗ 募集方法を確認').setCustomId('dummy').setStyle(ButtonStyle.Secondary).setDisabled(true),
        ]);
    }

    return button;
}
