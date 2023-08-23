import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    Guild,
    Message,
    TextBasedChannel,
    VoiceBasedChannel,
    VoiceState,
} from 'discord.js';

import { createVCLockedButton } from './voice_lock';
import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { Merge, exists, getDeveloperMention, notExists } from '../../common/others';
import { sendStickyMessage } from '../../common/sticky_message';

const logger = log4js_obj.getLogger('voiceStateUpdate');

export async function vcToolsStickyFromMessage(message: Message<true>) {
    if (notExists(message.member) || message.member.user.bot) return;

    const guild = message.guild;
    const channel = message.channel;

    if (!channel.isVoiceBased()) return;

    await sendVCToolsSticky(guild, channel, false);
}

export async function vcToolsStickyFromVoiceState(voiceState: VoiceState, showOnboarding = false) {
    const guild = voiceState.guild;
    const channel = voiceState.channel;

    if (notExists(channel) || !channel.isTextBased()) return;

    // ボットの入室時はオンボーディングを表示しない
    if (exists(voiceState.member) && voiceState.member.user.bot) {
        showOnboarding = false;
    }

    // 最初の1人以外はオンボーディングを表示しない
    if (channel.members.size !== 1) {
        showOnboarding = false;
    }

    await sendVCToolsSticky(guild, channel, showOnboarding);
}

/**
 * VCToolsのSticky Messageを送信する
 * @param {Guild} guild guildオブジェクト
 * @param {Merge<TextBasedChannel & VoiceBasedChannel>} channel チャンネルオブジェクト
 * @param {boolean} showOnboarding チャンネルに初めて入ったときの案内を表示するかどうか
 */
export async function sendVCToolsSticky(
    guild: Guild,
    channel: Merge<TextBasedChannel & VoiceBasedChannel>,
    showOnboarding: boolean,
) {
    try {
        if (notExists(process.env.CATEGORY_ID_PHONETIC_VC)) {
            return await channel.send(
                getDeveloperMention() + 'カテゴリID`CATEGORY_ID_PHONETIC_VC`が設定されてないでし！',
            );
        }

        const vcCategory = await searchChannelById(guild, process.env.CATEGORY_ID_PHONETIC_VC);

        if (notExists(vcCategory) || vcCategory.type !== ChannelType.GuildCategory) {
            return await channel.send(
                getDeveloperMention() + 'カテゴリID`CATEGORY_ID_PHONETIC_VC`がおかしいでし！',
            );
        }

        if (!vcCategory.children.cache.has(channel.id)) {
            return;
        }

        await sendStickyMessage(guild, channel.id, {
            embeds: showOnboarding ? [createVCToolsEmbed(channel)] : [],
            components: createVCToolsButtons(channel),
        });
    } catch (error) {
        logger.error(error);
    }
}

function createVCToolsEmbed(channel: Merge<TextBasedChannel & VoiceBasedChannel>) {
    const embed = new EmbedBuilder();
    embed.setTitle(channel.name + 'で利用できるコマンド');
    embed.setDescription(`<#${channel.id}>で利用できるVC関連ツールを紹介するでし！`);
    embed.addFields(
        {
            name: '読み上げ機能',
            value: 'テキストチャットの内容を読み上げるでし！',
        },
        {
            name: 'VCロック機能',
            value: '指定人数でVCに入室制限をかけるでし！',
        },
    );
    embed.setTimestamp();
    return embed;
}

export function createVCToolsButtons(channel: Merge<TextBasedChannel & VoiceBasedChannel>) {
    const buttons = [createMenuButton(channel)];
    if (channel.userLimit !== 0) {
        buttons.unshift(createVCLockedButton(channel));
    }
    return buttons;
}

export function createMenuButton(channel: Merge<TextBasedChannel & VoiceBasedChannel>) {
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createReadButton(channel),
        createLockButton(channel),
        createRequestRadioButton(),
    );
    return buttons;
}

function createReadButton(channel: Merge<TextBasedChannel & VoiceBasedChannel>) {
    const bukichi = channel.members.find((member) => member.user.id === process.env.DISCORD_BOT_ID);

    if (notExists(bukichi)) {
        return new ButtonBuilder()
            .setCustomId('voiceJoin')
            .setLabel('読み上げ開始')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔊');
    } else {
        return new ButtonBuilder()
            .setCustomId('voiceKill')
            .setLabel('読み上げ終了')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔇');
    }
}

function createLockButton(channel: Merge<TextBasedChannel & VoiceBasedChannel>) {
    const limit = channel.userLimit;
    if (limit === 0) {
        return new ButtonBuilder()
            .setCustomId('LockSwitch')
            .setLabel('制限なし')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🔓');
    } else {
        return new ButtonBuilder()
            .setCustomId('LockSwitch')
            .setLabel(limit + '人')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒');
    }
}

function createRequestRadioButton() {
    return new ButtonBuilder()
        .setCustomId('requestRadio')
        .setLabel('ラジオ')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📻');
}
