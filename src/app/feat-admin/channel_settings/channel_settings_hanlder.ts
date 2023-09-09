import { DBChannel } from '@prisma/client';
import {
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';

import { adminChannelSetting } from './admin_channel_setting';
import { vcToolsSetting } from './vcTools_setting';
import { ChannelService } from '../../../db/channel_service';
import { log4js_obj } from '../../../log4js_settings';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { getAPIMemberByInteraction } from '../../common/manager/member_manager';
import { exists, notExists } from '../../common/others';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('interaction');

export async function channelSettingsHandler(
    interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
) {
    try {
        await interaction.deferReply({ ephemeral: false });

        const guild = await getGuildByInteraction(interaction);
        const member = await getAPIMemberByInteraction(interaction);

        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return await interaction.editReply({
                content: 'チャンネルを管理する権限がないでし！',
            });
        }

        const options = interaction.options;
        const isVCToolsEnabled = options.getBoolean('vctoolsを使用する', false);
        const isAdminChannel = options.getBoolean('管理者限定チャンネルとして設定する', false);
        const targetChannel = options.getChannel('チャンネル', false) ?? interaction.channel;

        if (notExists(targetChannel)) {
            return await interaction.editReply({
                content: 'チャンネルまたはカテゴリが見つからなかったでし！',
            });
        }

        let dbChannel: DBChannel | null = null;

        if (exists(isVCToolsEnabled)) {
            const result = await vcToolsSetting(interaction, targetChannel, isVCToolsEnabled);
            if (notExists(result)) {
                await interaction.followUp({
                    content: 'VCToolsの設定に失敗したでし！',
                });
            } else {
                dbChannel = result;
            }
        }

        if (exists(isAdminChannel)) {
            const result = await adminChannelSetting(interaction, targetChannel, isAdminChannel);
            if (notExists(result)) {
                await interaction.followUp({
                    content: '管理者限定チャンネルの設定に失敗したでし！',
                });
            } else {
                dbChannel = result;
            }
        }

        if (exists(dbChannel)) {
            await interaction.editReply({
                content: '設定を更新したでし！\n',
            });
        } else {
            dbChannel = await ChannelService.getChannel(guild.id, targetChannel.id);
            await interaction.editReply({
                content: '設定を表示するでし！\n',
            });
        }

        if (notExists(dbChannel)) {
            return await interaction.followUp({
                content: 'チャンネル情報が見つからなかったでし！',
            });
        }

        let channelType = 'チャンネル';

        if (dbChannel.type === ChannelType.GuildCategory) {
            channelType = 'カテゴリ';
        }

        const embed = new EmbedBuilder();
        embed.setTitle(channelType + '設定');
        embed.setDescription(`<#${dbChannel.channelId}>`);
        embed.addFields(
            {
                name: 'VCTools',
                value: dbChannel.isVCToolsEnabled ? '使用する' : '使用しない',
            },
            {
                name: '管理者限定',
                value: dbChannel.isAdminChannel ? 'はい' : 'いいえ',
            },
        );
        if (channelType === 'カテゴリ') {
            embed.setFooter({
                text: 'カテゴリに含まれるチャンネルはすべて同じ設定が継承されます。',
            });
        }

        await interaction.followUp({
            embeds: [embed],
        });
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
