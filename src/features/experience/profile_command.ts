import { SlashCommandBuilder } from 'discord.js';

import { handleProfile, handleProfileSettings } from './profile';

import type { GuildChatInputCommand } from '@/shared/command_types';

export const profileCommand: GuildChatInputCommand = {
    kind: 'chatInput',
    guildOnly: true,
    definition: new SlashCommandBuilder()
        .setName('プロフィール')
        .setDescription('イカ部歴やブキ、バッジをまとめた自分のプロフィールを表示します。')
        .setDMPermission(false),
    execute: handleProfile,
};

export const profileSettingsCommand: GuildChatInputCommand = {
    kind: 'chatInput',
    guildOnly: true,
    definition: new SlashCommandBuilder()
        .setName('プロフィール設定')
        .setDescription('自分のプロフィールを編集します。')
        .setDMPermission(false)
        .addSubcommand((sub) =>
            sub
                .setName('ブキ')
                .setDescription('好きなブキを登録、変更します。')
                .addStringOption((option) =>
                    option
                        .setName('名前')
                        .setDescription('好きなブキの名前')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(40),
                ),
        )
        .addSubcommand((sub) =>
            sub.setName('ブキ解除').setDescription('好きなブキの登録を解除します。'),
        ),
    execute: handleProfileSettings,
};
