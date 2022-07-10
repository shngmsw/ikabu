const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { commandNames } = require('./constant.js');

require('dotenv').config();
const voiceLock = new SlashCommandBuilder()
    .setName(commandNames.voice_channel)
    .setDescription('ボイスチャンネルの人数制限を設定します。')
    .addIntegerOption((option) =>
        option.setName('limit').setDescription('制限人数を指定する場合は1～99で指定してください。').setRequired(false),
    );
const closeRecruit = new SlashCommandBuilder()
    .setName(commandNames.close)
    .setDescription('募集を〆ます。ボタンが使えないときに使ってください。');

const otherGame = new SlashCommandBuilder()
    .setName(commandNames.other_game)
    .setDescription('スプラ以外のゲーム募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('apex')
            .setDescription('ApexLegendsの募集')
            .addIntegerOption((option) =>
                option.setName('募集人数').setDescription('あと何人募集する？（最低でもほしい人数）').setRequired(true),
            )
            .addIntegerOption((option) => option.setName('最大人数').setDescription('最高何人までなら一緒にあそべる？'))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('mhr')
            .setDescription('モンスターハンターライズ:サンブレイクの募集')
            .addIntegerOption((option) =>
                option.setName('募集人数').setDescription('あと何人募集する？（最低でもほしい人数）').setRequired(true),
            )
            .addIntegerOption((option) => option.setName('最大人数').setDescription('最高何人までなら一緒にあそべる？'))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('dbd')
            .setDescription('Dead by Daylightの募集')
            .addIntegerOption((option) =>
                option.setName('募集人数').setDescription('あと何人募集する？（最低でもほしい人数）').setRequired(true),
            )
            .addIntegerOption((option) => option.setName('最大人数').setDescription('最高何人までなら一緒にあそべる？'))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('valo')
            .setDescription('Valorantの募集')
            .addIntegerOption((option) =>
                option.setName('募集人数').setDescription('あと何人募集する？（最低でもほしい人数）').setRequired(true),
            )
            .addIntegerOption((option) => option.setName('最大人数').setDescription('最高何人までなら一緒にあそべる？'))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('other')
            .setDescription('その他別ゲーの募集')
            .addStringOption((option) =>
                option.setName('ゲームタイトル').setDescription('ゲームタイトルを入力してください。').setRequired(true),
            )
            .addIntegerOption((option) =>
                option.setName('募集人数').setDescription('あと何人募集する？（最低でもほしい人数）').setRequired(true),
            )
            .addIntegerOption((option) => option.setName('最大人数').setDescription('最高何人までなら一緒にあそべる？'))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    );

const commands = [voiceLock, closeRecruit, otherGame];

//登録用関数
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
module.exports = async function registerSlashCommands() {
    const mode = process.env.SLASH_COMMAND_REGISTER_MODE;
    if (mode === 'guild') {
        await rest
            .put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID, process.env.SERVER_ID), { body: commands })
            .then(() => console.log('Successfully registered application guild commands.'))
            .catch(console.error);
    } else if (mode === 'global') {
        await rest
            .put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: commands })
            .then(() => console.log('Successfully registered application global commands.'))
            .catch(console.error);
    }
};
