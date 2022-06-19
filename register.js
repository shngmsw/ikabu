const { SlashCommandBuilder } = require(`@discordjs/builders`);
require('dotenv').config();

const voiceLock = new SlashCommandBuilder()
    .setName('voice_channel')
    .setDescription('ボイスチャンネルの人数制限を設定します。')
    .addStringOption((option) =>
        option
            .setName('status')
            .setDescription('ボイスチャンネルに人数制限をかけます。')
            .setRequired(true)
            .addChoices({ name: 'view', value: 'view' }, { name: 'lock', value: 'lock' }, { name: 'unlock', value: 'unlock' }),
    );

const commands = [voiceLock];

//登録用関数
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
async function main() {
    await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: commands });
}

main().catch((err) => console.log(err));
