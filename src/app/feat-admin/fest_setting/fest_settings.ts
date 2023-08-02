import { ChannelType, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';

import { festEnd } from './fest_end';
import { festStart } from './fest_start';
import { searchChannelById } from '../../common/manager/channel_manager';
import { getGuildByInteraction } from '../../common/manager/guild_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { notExists } from '../../common/others';

export async function festSettingHandler(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    await interaction.deferReply({ ephemeral: false });

    const guild = await getGuildByInteraction(interaction);
    const member = await searchAPIMemberById(guild, interaction.member.user.id);

    if (notExists(member)) {
        return await interaction.editReply('メンバー情報が取得できなかったでし！');
    }

    // 権限チェック
    if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return await interaction.editReply('チャンネルを管理する権限がないでし！');
    }

    const categoryId = process.env.CATEGORY_ID_RECRUIT_FESTIVAL;

    // .envにカテゴリIDが設定されているかチェック
    if (notExists(categoryId)) {
        return await interaction.editReply('カテゴリIDが設定されていないでし！');
    }

    const categoryChannel = await searchChannelById(guild, categoryId);

    if (notExists(categoryChannel) || categoryChannel.type !== ChannelType.GuildCategory) {
        return await interaction.editReply('カテゴリチャンネルが見つからないでし！');
    }

    const { options } = interaction;

    const subCommand = options.getSubcommand(true);

    switch (subCommand) {
        case '開始':
            await festStart(interaction, guild, categoryChannel);
            break;
        case '終了':
            await festEnd(interaction, guild, categoryChannel);
            break;
        default:
            break;
    }
}
