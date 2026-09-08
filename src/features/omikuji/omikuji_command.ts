import { SlashCommandBuilder } from 'discord.js';

import { handleOmikuji } from './omikuji';

import type { GlobalChatInputCommand } from '@/shared/command_types';

export const omikujiCommand: GlobalChatInputCommand = {
    kind: 'chatInput',
    guildOnly: false,
    definition: new SlashCommandBuilder()
        .setName('おみくじ')
        .setDescription('おみくじを振って、今の運勢を占うでし！'),
    execute: handleOmikuji,
};
