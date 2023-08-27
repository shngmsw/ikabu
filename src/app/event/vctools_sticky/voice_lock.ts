import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    DiscordAPIError,
    TextBasedChannel,
    VoiceBasedChannel,
    VoiceState,
} from 'discord.js';

import { createVCToolsButtons } from './vc_tools_message';
import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { getAPIMemberByInteraction } from '../../common/manager/member_manager';
import { Merge, getDeveloperMention, notExists } from '../../common/others';
import { VCLockButton } from '../../constant/button_id';

const logger = log4js_obj.getLogger('interaction');

/*
 * ボタンが押されたときの動作
 */
export async function voiceLockUpdate(
    interaction: ButtonInteraction<'cached' | 'raw'>,
    customId: VCLockButton,
) {
    try {
        const member = await getAPIMemberByInteraction(interaction);
        const channel = interaction.channel;

        if (notExists(channel) || !channel.isVoiceBased()) {
            return await interaction.reply({
                content: 'ボイスチャンネルでないと操作できないでし！',
                ephemeral: true,
            });
        }

        // ボイスチャンネル内のメンバー数
        const vcMemberNum = channel.members.size;
        // ボイスチャンネル未接続or違うボイスチャンネル接続中だと弾く
        if (notExists(member.voice.channel) || member.voice.channel.id != channel.id) {
            return await interaction.reply({
                content: '対象のボイスチャンネルに接続する必要があるでし！',
                ephemeral: true,
            });
        }
        let limit = channel.userLimit;
        // ロック切り替えボタンを押したとき
        if (customId === VCLockButton.LockSwitch) {
            if (channel.userLimit === 0) {
                await channel.setUserLimit(vcMemberNum);
            } else {
                await channel.setUserLimit(0);
            }
        }
        if (limit !== 0) {
            if (customId === VCLockButton.Increase1) {
                // 99人で押されたときは何もしない
                if (limit !== 99) {
                    limit += 1;
                    await channel.setUserLimit(limit);
                }
            } else if (customId === VCLockButton.Increase10) {
                // 99人で押されたときは何もしない
                if (limit !== 90) {
                    limit += 10;
                    await channel.setUserLimit(limit);
                }
            } else if (customId === VCLockButton.Decrease1) {
                // 1人で押されたときは何もしない
                if (limit !== 1) {
                    limit -= 1;
                    await channel.setUserLimit(limit);
                }
            } else if (customId === VCLockButton.Decrease10) {
                // 1人で押されたときは何もしない
                if (limit !== 10) {
                    limit -= 10;
                    await channel.setUserLimit(limit);
                }
            }
        } else {
            // ロックされていないのに'＋'or'－'が押されたときの動作
            if (
                customId === VCLockButton.Increase1 ||
                customId === VCLockButton.Increase10 ||
                customId === VCLockButton.Decrease1 ||
                customId === VCLockButton.Decrease10
            ) {
                return await interaction.reply({
                    content: '今はロックされてないでし！',
                    ephemeral: true,
                });
            }
        }

        return await interaction.update({ components: createVCToolsButtons(channel) });
    } catch (error) {
        if (error instanceof DiscordAPIError && error.code === 10008) {
            // ボタンを押されたときにメッセージが削除されていた場合
            logger.warn('interaction.message was missing. (Sticky)');
        } else {
            logger.error(error);
        }
    }
}

export async function disableLimit(voiceState: VoiceState) {
    const guild = voiceState.guild;
    const channel = voiceState.channel;

    if (notExists(channel) || !channel.isTextBased()) return;

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

    if (channel.members.size == 0) {
        await channel.setUserLimit(0);
    }
}

/**
 * ボタンを作成する
 * @param {*} channel チャンネルオブジェクト
 * @returns 作成したボタンを返す
 */
export function createVCLockedButton(channel: Merge<TextBasedChannel & VoiceBasedChannel>) {
    const button = new ActionRowBuilder<ButtonBuilder>();
    const limit = channel.userLimit;

    if (limit === 1) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Decrease1)
                .setLabel('－1')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Decrease1)
                .setLabel('－1')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
        ]);
    }

    if (limit <= 10) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Decrease10)
                .setLabel('－10')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Decrease10)
                .setLabel('－10')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
        ]);
    }

    if (limit >= 89) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Increase10)
                .setLabel('＋10')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Increase10)
                .setLabel('＋10')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
        ]);
    }

    if (limit === 99) {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Increase1)
                .setLabel('＋1')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        ]);
    } else {
        button.addComponents([
            new ButtonBuilder()
                .setCustomId(VCLockButton.Increase1)
                .setLabel('＋1')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
        ]);
    }

    return button;
}
