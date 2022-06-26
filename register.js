const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { commandNames } = require('./constant.js');

require('dotenv').config();
const voiceLock = new SlashCommandBuilder().setName(commandNames.voice_channel).setDescription('ボイスチャンネルの人数制限を設定します。');
const closeRecruit = new SlashCommandBuilder()
    .setName(commandNames.close)
    .setDescription('募集を〆ます。ボタンが使えないときに使ってください。');

const commands = [voiceLock, closeRecruit];

//登録用関数
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
async function main() {
    await rest
        .put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: [] })
        .then(() => console.log('Successfully deleted application commands.'))
        .catch(console.error);

    await rest
        .put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID, process.env.SERVER_ID), { body: [] })
        .then(() => console.log('Successfully deleted application guild commands.'))
        .catch(console.error);

    await rest
        .put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID, process.env.SERVER_ID), { body: commands })
        .then(() => console.log('Successfully registered application guild commands.'))
        .catch(console.error);
}

main().catch((err) => console.log(err));
