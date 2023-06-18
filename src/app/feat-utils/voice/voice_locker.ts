import { setTimeout } from 'timers/promises';

import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    ChatInputCommandInteraction,
    VoiceState,
    Channel,
} from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { assertExistCheck, exists, notExists } from '../../common/others';
const logger = log4js_obj.getLogger('interaction');

/*
 * スラコマ打たれたときの動作
 */
export async function voiceLocker(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    const guild = await getGuildByInteraction(interaction);
    const author = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(author, 'author');
    const channel = interaction.channel;
    assertExistCheck(channel, 'channel');
    const limitNum = interaction.options.getInteger('人数');

    // ボイスチャンネル未接続or違うボイスチャンネル接続中だと弾く
    if (notExists(author.voice.channel) || author.voice.channel.id != channel.id) {
        await interaction.reply({
            content: '接続中のボイスチャンネルでコマンドを打つでし！',
            ephemeral: true,
        });
        return;
    }

    let channelState;

    // optionの判定
    if (exists(limitNum)) {
        if (limitNum < 0 || limitNum > 99) {
            await interaction.reply({
                content: '制限人数は0～99の間で指定するでし！',
                ephemeral: true,
            });
            return;
        }

        channelState = {
            id: channel.id,
            limit: limitNum,
            isLock: limitNum == 0 ? false : true,
        };

        if (channel.isVoiceBased()) {
            // 制限人数を反映
            await channel.setUserLimit(limitNum);
        }
    } else {
        channelState = await getVoiceChannelState(channel);
    }

    if (exists(channelState)) {
        const embed = createEmbed(channelState);
        const button = createButton(channelState);

        await interaction
            .reply({
                embeds: [embed],
                components: [button],
                fetchReply: true,
            })
            .catch((error) => {
                logger.error(error);
            });

        // 1分後にメッセージを削除
        await setTimeout(60000);
        await interaction.deleteReply();
    } else {
        await interaction.reply({
            content: '`[ERROR]`チャンネルが見つからなかったでし！',
        });
    }
}

/*
 * ボタンが押されたときの動作
 */
export async function voiceLockerUpdate(interaction: ButtonInteraction<'cached' | 'raw'>) {
    const guild = await getGuildByInteraction(interaction);

    const member = await searchAPIMemberById(guild, interaction.member.user.id);
    assertExistCheck(member, 'member');
    const channel = interaction.channel;
    assertExistCheck(channel, 'channel');

    if (!channel.isVoiceBased()) {
        return await interaction.reply({
            content: 'ボイスチャンネルでないと操作できないでし！',
            ephemeral: true,
        });
    }

    // ボイスチャンネル内のメンバー数
    const voiceMemberNum = channel.members.size;

    // ボイスチャンネル未接続or違うボイスチャンネル接続中だと弾く
    if (notExists(member.voice.channel) || member.voice.channel.id != channel.id) {
        await interaction.reply({
            content: '対象のボイスチャンネルに接続する必要があるでし！',
            ephemeral: true,
        });
        return;
    }

    const channelState = await getVoiceChannelState(channel);

    let limit = Number(channelState.limit);

    // 'LOCK'ボタンor'UNLOCK'ボタンを押したとき
    if (interaction.customId == 'voiceLockOrUnlock') {
        const label = interaction.component.label; // ボタンのラベルから設定する状態を取得
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
            await interaction
                .reply({
                    content: '今はロックされてないでし！',
                    ephemeral: true,
                    fetchReply: true,
                })
                .catch((error) => {
                    logger.error(error);
                });
            return;
        }
    }

    await interaction
        .update({
            embeds: [createEmbed(channelState)],
            components: [createButton(channelState)],
            fetchReply: true,
        })
        .catch((error) => {
            logger.error(error);
        });
}

export async function disableLimit(oldState: VoiceState) {
    const usable_channel = [
        'alfa',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'fox',
        'golf',
        'hotel',
        'india',
        'juliett',
        'kilo',
        'lima',
        'mike',
    ];
    const oldChannel = await oldState.guild.channels.fetch(oldState.channelId);
    // 使用可能VCかチェック
    if (!usable_channel.includes(oldChannel.name)) {
        return;
    }

    if (oldChannel.members.size == 0) {
        oldChannel.setUserLimit(0);
    }
}

type ChannelState = {
    id: string;
    limit: number;
    isLock: boolean;
};

/**
 * チャンネル情報のオブジェクトを作成する
 * @param {*} channel チャンネル情報
 * @returns channelStateのオブジェクトを返す
 */
async function getVoiceChannelState(channel: Channel) {
    if (channel.isVoiceBased()) {
        const channelStateObj: ChannelState = {
            id: channel.id,
            limit: channel.userLimit,
            isLock: channel.userLimit == 0 ? false : true,
        };

        return channelStateObj;
    } else {
        return null;
    }
}

/**
 * ボタンを作成する
 * @param {*} channelState チャンネル情報の読み込み
 * @returns 作成したボタンを返す
 */
function createButton(channelState: ChannelState) {
    const button = new ActionRowBuilder<ButtonBuilder>();
    const limit = channelState.limit;
    if (channelState.isLock) {
        // 制限人数が1のとき，'－'ボタンを無効化
        if (limit == 1) {
            button.addComponents([
                new ButtonBuilder().setCustomId('voiceLock_dec').setLabel('－').setStyle(ButtonStyle.Primary).setDisabled(true),
            ]);
        } else {
            button.addComponents([
                new ButtonBuilder().setCustomId('voiceLock_dec').setLabel('－').setStyle(ButtonStyle.Primary).setDisabled(false),
            ]);
        }

        button.addComponents([
            new ButtonBuilder().setCustomId('voiceLockOrUnlock').setLabel('UNLOCK').setStyle(ButtonStyle.Success).setEmoji('🔓'),
        ]);

        // 制限人数が99のとき，'＋'ボタンを無効化
        if (limit == 99) {
            button.addComponents([
                new ButtonBuilder().setCustomId('voiceLock_inc').setLabel('＋').setStyle(ButtonStyle.Primary).setDisabled(true),
            ]);
        } else {
            button.addComponents([
                new ButtonBuilder().setCustomId('voiceLock_inc').setLabel('＋').setStyle(ButtonStyle.Primary).setDisabled(false),
            ]);
        }
    } else {
        button.addComponents([
            new ButtonBuilder().setCustomId('voiceLock_dec').setLabel('－').setStyle(ButtonStyle.Primary).setDisabled(true),
            new ButtonBuilder().setCustomId('voiceLockOrUnlock').setLabel('LOCK').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('voiceLock_inc').setLabel('＋').setStyle(ButtonStyle.Primary).setDisabled(true),
        ]);
    }
    return button;
}

/**
 * Embedを作成する
 * @param {*} channelState チャンネル情報の読み込み
 * @returns 作成したEmbedを返す
 */
function createEmbed(channelState: ChannelState) {
    let limit;
    // 制限人数表示用の判定
    if (channelState.limit === 0) {
        limit = '∞';
    } else {
        limit = channelState.limit;
    }
    const embed = new EmbedBuilder()
        .setTitle('ボイスチャンネル情報')
        .addFields([{ name: '対象のチャンネル', value: '<#' + channelState.id + '>' }]);
    if (channelState.isLock) {
        embed.addFields([
            {
                name: '状態',
                value: '制限中',
            },
        ]),
            embed.setColor('#d83c3e');
    } else {
        embed.addFields([
            {
                name: '状態',
                value: '制限なし',
            },
        ]),
            embed.setColor('#2d7d46');
    }
    embed.addFields([{ name: '人数制限', value: String(limit) }]);
    return embed;
}
