const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { setTimeout } = require('timers/promises');

/*
 * スラコマ打たれたときの動作
 */
module.exports.voiceLocker = async function (interaction) {
    const author = interaction.member;
    const channel = interaction.channel;

    // ボイスチャンネル未接続or違うボイスチャンネル接続中だと弾く
    if (author.voice.channel == null || author.voice.channel.id != channel.id) {
        await interaction.reply({ content: '接続中のボイスチャンネルでコマンドを打つでし！', ephemeral: true });
        return;
    }

    let channelState;

    // optionの判定
    if (interaction.options.getInteger('limit') != null) {
        let limitNum = interaction.options.getInteger('limit');
        if (limitNum < 0 || limitNum > 99) {
            await interaction.reply({ content: '制限人数は0～99の間で指定するでし！', ephemeral: true });
            return;
        }

        channelState = {
            id: channel.id,
            limit: limitNum,
            isLock: limitNum == 0 ? false : true,
        };

        // 制限人数を反映
        channel.setUserLimit(limitNum);
    } else {
        channelState = await getVoiceChannelState(interaction);
    }

    const embed = createEmbed(channelState);
    const button = createButton(channelState);

    await interaction
        .reply({
            embeds: [embed],
            components: [button],
            fetchReply: true,
        })
        .catch(console.error);

    // 1分後にメッセージを削除
    await setTimeout(60000);
    await interaction.deleteReply();
};

/*
 * ボタンが押されたときの動作
 */
module.exports.voiceLockerUpdate = async function (interaction) {
    const member = interaction.member;
    const channel = interaction.channel;
    // ボイスチャンネル内のメンバー数
    const voiceMemberNum = channel.members.size;

    // ボイスチャンネル未接続or違うボイスチャンネル接続中だと弾く
    if (member.voice.channel == null || member.voice.channel.id != channel.id) {
        await interaction.reply({ content: '対象のボイスチャンネルに接続する必要があるでし！', ephemeral: true });
        return;
    }

    let channelState = await getVoiceChannelState(interaction);

    let limit = Number(channelState.limit);

    // 'LOCK'ボタンor'UNLOCK'ボタンを押したとき
    if (interaction.customId == 'voiceLockOrUnlock') {
        let label = interaction.component.label; // ボタンのラベルから設定する状態を取得
        if (label === 'LOCK') {
            await interaction.channel.setUserLimit(voiceMemberNum);
            channelState.isLock = true;
            channelState.limit = voiceMemberNum;
        } else if (label === 'UNLOCK') {
            await interaction.channel.setUserLimit(0);
            channelState.isLock = false;
            channelState.limit = 0;
        }
    }

    // 以前に出したEmbedの操作が行われた時用の判定
    if (channelState.isLock) {
        if (interaction.customId === 'voiceLock_inc') {
            // 99人で押されたときは何もしない
            if (limit != 99) {
                limit += 1;
                channelState.limit = limit;
                await interaction.channel.setUserLimit(limit);
            }
        } else if (interaction.customId === 'voiceLock_dec') {
            // 1人で押されたときは何もしない
            if (limit != 1) {
                limit -= 1;
                channelState.limit = limit;
                await interaction.channel.setUserLimit(limit);
            }
        }
    } else {
        // ロックされていないのに'＋'or'－'が押されたときの動作
        if (interaction.customId === 'voiceLock_inc' || interaction.customId === 'voiceLock_dec') {
            await interaction.reply({ content: '今はロックされてないでし！', ephemeral: true, fetchReply: true }).catch(console.error);
            return;
        }
    }

    await interaction
        .update({
            embeds: [createEmbed(channelState)],
            components: [createButton(channelState)],
            fetchReply: true,
        })
        .catch(console.error);
};

/**
 * インタラクションからチャンネル情報を取得する用のオブジェクトを作成する
 * @param {*} interaction
 * @returns channelStateのオブジェクトを返す
 */
async function getVoiceChannelState(interaction) {
    const channel = interaction.member.voice.channel;

    const channelStateObj = {
        id: channel.id,
        limit: channel.userLimit,
        isLock: channel.userLimit == 0 ? false : true,
    };

    return channelStateObj;
}

/**
 * ボタンを作成する
 * @param {*} channelState チャンネル情報の読み込み
 * @returns 作成したボタンを返す
 */
function createButton(channelState) {
    const button = new MessageActionRow();
    const limit = channelState.limit;
    if (channelState.isLock) {
        // 制限人数が1のとき，'－'ボタンを無効化
        if (limit == 1) {
            button.addComponents([new MessageButton().setCustomId('voiceLock_dec').setLabel('－').setStyle('PRIMARY').setDisabled(true)]);
        } else {
            button.addComponents([new MessageButton().setCustomId('voiceLock_dec').setLabel('－').setStyle('PRIMARY').setDisabled(false)]);
        }

        button.addComponents([new MessageButton().setCustomId('voiceLockOrUnlock').setLabel('UNLOCK').setStyle('SUCCESS').setEmoji('🔓')]);

        // 制限人数が99のとき，'＋'ボタンを無効化
        if (limit == 99) {
            button.addComponents([new MessageButton().setCustomId('voiceLock_inc').setLabel('＋').setStyle('PRIMARY').setDisabled(true)]);
        } else {
            button.addComponents([new MessageButton().setCustomId('voiceLock_inc').setLabel('＋').setStyle('PRIMARY').setDisabled(false)]);
        }
    } else {
        button.addComponents([
            new MessageButton().setCustomId('voiceLock_dec').setLabel('－').setStyle('PRIMARY').setDisabled(true),
            new MessageButton().setCustomId('voiceLockOrUnlock').setLabel('LOCK').setStyle('DANGER').setEmoji('🔒'),
            new MessageButton().setCustomId('voiceLock_inc').setLabel('＋').setStyle('PRIMARY').setDisabled(true),
        ]);
    }
    return button;
}

/**
 * Embedを作成する
 * @param {*} channelState チャンネル情報の読み込み
 * @returns 作成したEmbedを返す
 */
function createEmbed(channelState) {
    let limit;
    // 制限人数表示用の判定
    if (channelState.limit === 0) {
        limit = '∞';
    } else {
        limit = channelState.limit;
    }
    const embed = new MessageEmbed().setTitle('ボイスチャンネル情報').addField('対象のチャンネル', '<#' + channelState.id + '>');
    if (channelState.isLock) {
        embed.addField('状態', '制限中');
        embed.setColor('#d83c3e');
    } else {
        embed.addField('状態', '制限なし');
        embed.setColor('#2d7d46');
    }
    embed.addField('人数制限', String(limit));
    return embed;
}
