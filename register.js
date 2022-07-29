const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { ChannelType } = require('discord-api-types/v10');
const { commandNames } = require('./constant.js');

require('dotenv').config();
const voiceLock = new SlashCommandBuilder()
    .setName(commandNames.voice_channel)
    .setDescription('ボイスチャンネルの人数制限を設定します。')
    .addIntegerOption((option) =>
        option.setName('limit').setDescription('制限人数を指定する場合は1～99で指定してください。').setRequired(false),
    );
const friendCode = new SlashCommandBuilder()
    .setName(commandNames.friend_code)
    .setDescription('フレンドコードの登録・表示')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('フレンドコードを登録します。')
            .addStringOption((option) => option.setName('フレンドコード').setDescription('例：SW-0000-0000-0000').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('show')
            .setDescription('登録したフレンドコードを表示します。未登録の場合は自己紹介から引用します。')
            .addUserOption((option) =>
                option.setName('user').setDescription('フレンドコードを表示したい人を指定してください。').setRequired(true),
            ),
    );

const wiki = new SlashCommandBuilder()
    .setName(commandNames.wiki)
    .setDescription('wikipediaで調べる')
    .addStringOption((option) => option.setName('キーワード').setDescription('調べたいキーワードを入力').setRequired(true));

const kansen = new SlashCommandBuilder()
    .setName(commandNames.kansen)
    .setDescription('プラベの観戦する人をランダムな組み合わせで抽出します。')
    .addIntegerOption((option) =>
        option.setName('回数').setDescription('何回分の組み合わせを抽出するかを指定します。5回がおすすめ').setRequired(true),
    );

const minutesTimer = new SlashCommandBuilder()
    .setName(commandNames.timer)
    .setDescription('分タイマー')
    .addIntegerOption((option) => option.setName('分').setDescription('〇〇分後まで1分ごとにカウントダウンします。').setRequired(true));

const pick = new SlashCommandBuilder()
    .setName(commandNames.pick)
    .setDescription('選択肢の中からランダムに抽出します。')
    .addStringOption((option) => option.setName('選択肢').setDescription('半角スペースで区切って入力してください。').setRequired(true))
    .addIntegerOption((option) =>
        option.setName('ピックする数').setDescription('2つ以上ピックしたい場合は指定してください。').setRequired(false),
    );

const vpick = new SlashCommandBuilder()
    .setName(commandNames.voice_pick)
    .setDescription('VCに接続しているメンバーからランダムに抽出します。')
    .addIntegerOption((option) =>
        option.setName('ピックする人数').setDescription('2人以上ピックしたい場合は指定してください。').setRequired(false),
    );
const closeRecruit = new SlashCommandBuilder()
    .setName(commandNames.close)
    .setDescription('募集を〆ます。ボタンが使えないときに使ってください。');

const regularMatch = new SlashCommandBuilder()
    .setName(commandNames.regular)
    .setDescription('ナワバリ募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('now')
            .setDescription('現在のナワバリバトルの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices(
                        { name: '@1', value: 1 },
                        { name: '@2', value: 2 },
                        { name: '@3', value: 3 },
                        { name: '@4', value: 4 },
                        { name: '@5', value: 5 },
                        { name: '@6', value: 6 },
                        { name: '@7', value: 7 },
                    )
                    .setRequired(true),
            )
            .addStringOption((option) => option.setName('参加条件').setDescription('プレイ内容や参加条件など').setRequired(false))
            .addChannelOption((option) =>
                option
                    .setName('使用チャンネル')
                    .setDescription('使用するボイスチャンネルを指定できます。')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者1').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者2').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者3').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('next')
            .setDescription('次のナワバリバトルの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices(
                        { name: '@1', value: 1 },
                        { name: '@2', value: 2 },
                        { name: '@3', value: 3 },
                        { name: '@4', value: 4 },
                        { name: '@5', value: 5 },
                        { name: '@6', value: 6 },
                        { name: '@7', value: 7 },
                    )
                    .setRequired(true),
            )
            .addStringOption((option) => option.setName('参加条件').setDescription('プレイ内容や参加条件など').setRequired(false))
            .addUserOption((option) =>
                option.setName('参加者1').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者2').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者3').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            ),
    );

const leagueMatch = new SlashCommandBuilder()
    .setName(commandNames.league)
    .setDescription('リグマ募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('now')
            .setDescription('現在のリーグマッチの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices({ name: '@1', value: 1 }, { name: '@2', value: 2 }, { name: '@3', value: 3 })
                    .setRequired(true),
            )
            .addStringOption((option) => option.setName('参加条件').setDescription('プレイ内容や参加条件など').setRequired(false))
            .addUserOption((option) =>
                option.setName('参加者1').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者2').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addChannelOption((option) =>
                option
                    .setName('使用チャンネル')
                    .setDescription('使用するボイスチャンネルを指定できます。')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('next')
            .setDescription('次のリーグマッチの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices({ name: '@1', value: 1 }, { name: '@2', value: 2 }, { name: '@3', value: 3 })
                    .setRequired(true),
            )
            .addStringOption((option) => option.setName('参加条件').setDescription('プレイ内容や参加条件など').setRequired(false))
            .addUserOption((option) =>
                option.setName('参加者1').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者2').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            ),
    );

const salmonRun = new SlashCommandBuilder()
    .setName(commandNames.salmon)
    .setDescription('サーモンラン募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('run')
            .setDescription('サーモンランの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices({ name: '@1', value: 1 }, { name: '@2', value: 2 }, { name: '@3', value: 3 })
                    .setRequired(true),
            )
            .addStringOption((option) => option.setName('参加条件').setDescription('プレイ内容や参加条件など').setRequired(false))
            .addUserOption((option) =>
                option.setName('参加者1').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addUserOption((option) =>
                option.setName('参加者2').setDescription('既に決定している参加者を指定してください。').setRequired(false),
            )
            .addChannelOption((option) =>
                option
                    .setName('使用チャンネル')
                    .setDescription('使用するボイスチャンネルを指定できます。')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(false),
            ),
    );

const privateMatch = new SlashCommandBuilder()
    .setName(commandNames.private)
    .setDescription('プラベ募集コマンド')
    .addStringOption((option) => option.setName('開始時刻').setDescription('何時から始める？例：21:00').setRequired(true))
    .addStringOption((option) => option.setName('所要時間').setDescription('何時間ぐらいやる？例：2時間').setRequired(true))
    .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
    .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など'));

const otherGame = new SlashCommandBuilder()
    .setName(commandNames.other_game)
    .setDescription('スプラ以外のゲーム募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('apex')
            .setDescription('ApexLegendsの募集')
            .addStringOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数')
                    .setChoices({ name: '@1', value: '@1' }, { name: '@2', value: '@2' })
                    .setRequired(true),
            )
            .addChannelOption((option) =>
                option
                    .setName('使用チャンネル')
                    .setDescription('使用するボイスチャンネルを指定できます。')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(false),
            )
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('mhr')
            .setDescription('モンスターハンターライズ:サンブレイクの募集')
            .addStringOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数')
                    .setChoices({ name: '@1', value: '@1' }, { name: '@2', value: '@2' }, { name: '@3', value: '@3' })
                    .setRequired(true),
            )
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など'))
            .addChannelOption((option) =>
                option
                    .setName('使用チャンネル')
                    .setDescription('使用するボイスチャンネルを指定できます。')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('dbd')
            .setDescription('Dead by Daylightの募集')
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('valo')
            .setDescription('Valorantの募集')
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('other')
            .setDescription('その他別ゲーの募集')
            .addStringOption((option) =>
                option.setName('ゲームタイトル').setDescription('ゲームタイトルを入力してください。').setRequired(true),
            )
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    );

const commands = [
    voiceLock,
    friendCode,
    wiki,
    kansen,
    minutesTimer,
    pick,
    vpick,
    closeRecruit,
    otherGame,
    privateMatch,
    regularMatch,
    leagueMatch,
    salmonRun,
];

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
