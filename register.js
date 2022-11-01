const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { ChannelType } = require('discord-api-types/v10');
const { commandNames } = require('./constant.js');
const log4js = require('log4js');

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
        subcommand.setName('show').setDescription('登録したフレンドコードを表示します。未登録の場合は自己紹介から引用します。'),
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

const buki = new SlashCommandBuilder()
    .setName(commandNames.buki)
    .setDescription('ブキをランダムに抽出します。')
    .addIntegerOption((option) => option.setName('ブキの数').setDescription('指定するとn個のブキをランダムに選びます。').setRequired(false))
    .addStringOption((option) =>
        option
            .setName('ブキ種')
            .setDescription('ブキ種を指定したい場合は指定できます。')
            .setChoices(
                { name: 'シューター', value: 'shooter' },
                { name: 'ブラスター', value: 'blaster' },
                { name: 'シェルター', value: 'brella' },
                { name: 'フデ', value: 'brush' },
                { name: 'チャージャー', value: 'charger' },
                { name: 'マニューバー', value: 'maneuver' },
                { name: 'リールガン', value: 'reelgun' },
                { name: 'ローラー', value: 'roller' },
                { name: 'スロッシャー', value: 'slosher' },
                { name: 'スピナー', value: 'splatling' },
                { name: 'ワイパー', value: 'wiper' },
                { name: 'ストリンガー', value: 'stringer' },
            )
            .setRequired(false),
    );

const show = new SlashCommandBuilder()
    .setName(commandNames.show)
    .setDescription('ステージ情報を表示')
    .addSubcommand((subcommand) => subcommand.setName('now').setDescription('現在のバンカラマッチのステージ情報を表示'))
    .addSubcommand((subcommand) => subcommand.setName('next').setDescription('次のバンカラマッチのステージ情報を表示'))
    .addSubcommand((subcommand) => subcommand.setName('nawabari').setDescription('現在のナワバリステージ情報を表示'))
    .addSubcommand((subcommand) => subcommand.setName('run').setDescription('現在のシフトを表示'));

const help = new SlashCommandBuilder()
    .setName(commandNames.help)
    .setDescription('ヘルプを表示します。')
    .addSubcommand((subcommand) => subcommand.setName('recruit').setDescription('募集コマンドの使い方を表示'))
    .addSubcommand((subcommand) => subcommand.setName('voice').setDescription('読み上げ機能のヘルプを表示'))
    .addSubcommand((subcommand) => subcommand.setName('other').setDescription('募集コマンド以外の使い方を表示'));

const ban = new SlashCommandBuilder()
    .setName(commandNames.ban)
    .setDescription('banします。')
    .addUserOption((option) => option.setName('ban対象').setDescription('banする人を指定してください。').setRequired(true))
    .addStringOption((option) => option.setName('ban理由').setDescription('ban対象の人にブキチがDMします。').setRequired(true));

const chManager = new SlashCommandBuilder()
    .setName(commandNames.ch_manager)
    .setDescription('チャンネルを作ったり削除したり')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('チャンネル作成')
            .setDescription('チャンネル一括作成')
            .addAttachmentOption((option) =>
                option
                    .setName('csv')
                    .setDescription('CSV（ヘッダー有り）:catID,catName,chID,chName,chType,roleID,roleName,roleColor,member1,member2,member')
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('ロール作成')
            .setDescription('ロール作成')
            .addStringOption((option) => option.setName('ロール名').setDescription('ロール名を指定してください。').setRequired(true))
            .addStringOption((option) =>
                option.setName('ロールカラー').setDescription('カラーコードをhexで入力してください。').setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('ロール割当')
            .setDescription('ロール割当')
            .addMentionableOption((option) =>
                option.setName('ターゲットロール').setDescription('どのロールにつけますか？').setRequired(true),
            )
            .addMentionableOption((option) => option.setName('割当ロール').setDescription('どのロールをつけますか？').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('ロール解除')
            .setDescription('ロール解除')
            .addMentionableOption((option) =>
                option.setName('ターゲットロール').setDescription('どのロールから外しますか？').setRequired(true),
            )
            .addMentionableOption((option) => option.setName('解除ロール').setDescription('どのロールを外しますか？').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('ロール削除')
            .setDescription('ロール削除')
            .addMentionableOption((option) => option.setName('ロール名1').setDescription('ロール名を指定してください。').setRequired(true))
            .addMentionableOption((option) => option.setName('ロール名2').setDescription('ロール名を指定してください。').setRequired(false))
            .addMentionableOption((option) =>
                option.setName('ロール名3').setDescription('ロール名を指定してください。').setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('カテゴリー削除')
            .setDescription('カテゴリー削除')
            .addAttachmentOption((option) => option.setName('csv').setDescription('csv').setRequired(false))
            .addStringOption((option) =>
                option.setName('カテゴリーid').setDescription('カテゴリーIDを半角スペース区切りで指定').setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('チャンネル削除')
            .setDescription('チャンネル削除')
            .addStringOption((option) =>
                option.setName('チャンネルid').setDescription('チャンネルIDをを半角スペース区切りで指定').setRequired(true),
            ),
    );

const experience = new SlashCommandBuilder().setName(commandNames.experience).setDescription('イカ部歴を表示します。');

const voice = new SlashCommandBuilder()
    .setName(commandNames.voice)
    .setDescription('テキストチャットの読み上げコマンド')
    .addSubcommand((subcommand) => subcommand.setName('join').setDescription('読み上げを開始'))
    .addSubcommand((subcommand) =>
        subcommand
            .setName('type')
            .setDescription('読み上げボイスの種類を変更します。')
            .addStringOption((option) =>
                option
                    .setName('音声の種類')
                    .setDescription('声の種類を選択してください。')
                    .setChoices(
                        { name: 'ひかり（女性）', value: 'hikari' },
                        { name: 'はるか（女性）', value: 'haruka' },
                        { name: 'たける（男性）', value: 'takeru' },
                        { name: 'サンタ', value: 'santa' },
                        { name: '凶暴なクマ', value: 'bear' },
                        { name: 'ショウ（男性）', value: 'show' },
                    )
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) => subcommand.setName('kill').setDescription('読み上げを終了'));

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

const anarchyMatch = new SlashCommandBuilder()
    .setName(commandNames.anarchy)
    .setDescription('バンカラマッチ募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('now')
            .setDescription('現在のバンカラマッチの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices({ name: '@1', value: 1 }, { name: '@2', value: 2 }, { name: '@3', value: 3 })
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName('募集ウデマエ')
                    .setDescription('募集するウデマエを選択してください')
                    .setChoices(
                        { name: 'C', value: 'C' },
                        { name: 'B', value: 'B' },
                        { name: 'A', value: 'A' },
                        { name: 'S', value: 'S' },
                        { name: 'S+', value: 'S+' },
                    ),
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
            .setDescription('次のバンカラマッチの募集をたてます。')
            .addIntegerOption((option) =>
                option
                    .setName('募集人数')
                    .setDescription('募集人数を設定します。あなたの他に参加者が決定している場合は参加者に指定してください。')
                    .setChoices({ name: '@1', value: 1 }, { name: '@2', value: 2 }, { name: '@3', value: 3 })
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName('募集ウデマエ')
                    .setDescription('募集するウデマエを選択してください')
                    .setChoices(
                        { name: 'C', value: 'C' },
                        { name: 'B', value: 'B' },
                        { name: 'A', value: 'A' },
                        { name: 'S', value: 'S' },
                        { name: 'S+', value: 'S+' },
                    ),
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

const fesA = new SlashCommandBuilder()
    .setName(commandNames.fesA)
    .setDescription('フェス(フウカ陣営) 募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('now')
            .setDescription('現在のフェスマッチの募集をたてます。(フウカ陣営)')
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
            .setDescription('次のフェスマッチの募集をたてます。(フウカ陣営)')
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

const fesB = new SlashCommandBuilder()
    .setName(commandNames.fesB)
    .setDescription('フェス(マンタロー陣営) 募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('now')
            .setDescription('現在のフェスマッチの募集をたてます。(マンタロー陣営)')
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
            .setDescription('次のフェスマッチの募集をたてます。(マンタロー陣営)')
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

const fesC = new SlashCommandBuilder()
    .setName(commandNames.fesC)
    .setDescription('フェス(ウツホ陣営) 募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('now')
            .setDescription('現在のフェスマッチの募集をたてます。(ウツホ陣営)')
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
            .setDescription('次のフェスマッチの募集をたてます。(ウツホ陣営)')
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

const privateMatch = new SlashCommandBuilder()
    .setName(commandNames.private)
    .setDescription('プラベ募集コマンド')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('recruit')
            .setDescription('開始時刻や人数などを細かく設定できます。通常はこちらを使ってください。')
            .addStringOption((option) => option.setName('開始時刻').setDescription('何時から始める？例：21:00').setRequired(true))
            .addStringOption((option) => option.setName('所要時間').setDescription('何時間ぐらいやる？例：2時間').setRequired(true))
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('button')
            .setDescription('募集条件を通常のチャットで打ち込んだ後に通知と募集用のボタンを出せます。※@everyoneメンションを使用します。'),
    );

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
            .setName('valo')
            .setDescription('Valorantの募集')
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
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
            .setName('overwatch')
            .setDescription('Overwatch2の募集')
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
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
            .setName('other')
            .setDescription('その他別ゲーの募集')
            .addStringOption((option) =>
                option.setName('ゲームタイトル').setDescription('ゲームタイトルを入力してください。').setRequired(true),
            )
            .addStringOption((option) => option.setName('募集人数').setDescription('募集人数 (自由入力)').setRequired(true))
            .addStringOption((option) => option.setName('内容または参加条件').setDescription('プレイ内容や参加条件など')),
    );

const teamDivider = new SlashCommandBuilder()
    .setName(commandNames.team_divider)
    .setDescription('チーム分けを行います。')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('team')
            .setDescription('勝率に応じてチーム分けを行うことができます。')
            .addIntegerOption((option) =>
                option.setName('各チームのメンバー数').setDescription('それぞれのチームメンバー数(ex: スプラ=4, valo=5)').setRequired(true),
            )
            .addBooleanOption((option) => option.setName('勝利数と勝率を隠す').setDescription('勝利数と勝率を隠すことができます。')),
    );

const buttonEnable = new SlashCommandBuilder()
    .setName(commandNames.buttonEnable)
    .setDescription('ボタンを有効化します。(エラー落ちしたとき用)')
    .addChannelOption((option) =>
        option.setName('チャンネル').setDescription('有効化するボタンが投稿されているチャンネルを選択').setRequired(true),
    )
    .addStringOption((option) => option.setName('メッセージid').setDescription('有効化するボタンのメッセージIDを入力').setRequired(true));

const commands = [
    voiceLock,
    friendCode,
    wiki,
    kansen,
    teamDivider,
    minutesTimer,
    pick,
    vpick,
    buki,
    show,
    help,
    ban,
    chManager,
    experience,
    voice,
    closeRecruit,
    otherGame,
    privateMatch,
    regularMatch,
    leagueMatch,
    anarchyMatch,
    salmonRun,
    fesA,
    fesB,
    fesC,
    buttonEnable,
];

//登録用関数
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
module.exports = async function registerSlashCommands() {
    log4js.configure(process.env.LOG4JS_CONFIG_PATH);
    const logger = log4js.getLogger();

    const mode = process.env.SLASH_COMMAND_REGISTER_MODE;
    if (mode === 'guild') {
        await rest
            .put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID, process.env.SERVER_ID), { body: commands })
            .then(() => logger.info('Successfully registered application guild commands.'))
            .catch((error) => {
                logger.error(error);
            });
    } else if (mode === 'global') {
        await rest
            .put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: commands })
            .then(() => logger.info('Successfully registered application global commands.'))
            .catch((error) => {
                logger.error(error);
            });
    }
};
