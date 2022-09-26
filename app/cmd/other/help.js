const { MessageEmbed } = require('discord.js');

module.exports = async function handleHelp(interaction) {
    if (!interaction.isCommand()) return;
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    const { options } = interaction;
    const subCommand = options.getSubcommand();
    if (subCommand === 'voice') {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: 'ブキチの使い方(読み上げbot)',
                        iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg',
                    })
                    .setColor(0x1bc2a5)
                    .addFields([
                        {
                            name: 'ボイスチャンネルにブキチを参加',
                            value: '```/voice join```\n',
                        },
                        {
                            name: '音声タイプを変更します',
                            value: '```/voice type```\n',
                        },
                        {
                            name: 'ボイスチャンネルからブキチを切断',
                            value: '```/voice kill```\n',
                        },
                    ]),
            ],
        });
    } else if (subCommand === 'other') {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: 'ブキチの使い方(2/2)',
                        iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg',
                    })
                    .setColor(0x1bc2a5)
                    .addFields([
                        {
                            name: 'ステージ情報を表示[now / next / nawabari / run]',
                            value: '```/show ○○○```\n',
                        },
                        {
                            name: 'ランダム系コマンド',
                            value: 'ブキをランダムで選出：```/buki 複数の場合は数字を記入```\n',
                        },
                        {
                            name: '選択肢の中からランダム選出',
                            value: '```/pick 複数選出の場合は数字を記入 選択肢を半スペ空けで記入```',
                        },
                        {
                            name: '接続してるボイチャから数字分のヒトをランダム抽出',
                            value: '```/vpick 複数選出の場合は数字を記入```',
                        },
                        {
                            name: 'プラベの観戦者を抽出',
                            value: '```/kansen 試合回数分の数字を記入```',
                        },
                        {
                            name: '自分のフレンドコードを表示',
                            value: '```/friend_code show``\n「自己紹介」チャンネルの直近100件に書いてあればそちらを優先します。',
                        },
                        {
                            name: '自分のフレンドコードを登録',
                            value: '```/friend_code add SW-0000-0000-0000```\nもう一度登録すると上書きされます。他人のは登録できません。',
                        },
                        {
                            name: '自分のイカ部歴を表示',
                            value: '```/イカ部歴```\n',
                        },
                        {
                            name: 'wikipediaで調べる',
                            value: '```/wiki 〇〇```',
                        },
                    ]),
            ],
        });
    } else if (subCommand === 'recruit') {
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: 'ブキチの使い方(1/2)',
                        iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg',
                    })
                    .setColor(0x1bc2a5)
                    .addFields([
                        {
                            name: 'botのコマンド一覧を表示',
                            value: '```/help recruit または /help other または /help voice```',
                        },
                        {
                            name: 'プラベ募集コマンド',
                            value: '```/プラベ募集 recruit 開始時刻 所要時間 募集人数 内容または参加条件があれば記載```\n',
                        },
                        {
                            name: '現在のリグマ情報を表示して募集',
                            value: '```/リグマ募集 now 募集人数 参加メンバー 参加条件があれば記載```\n',
                        },
                        {
                            name: '次回のリグマ情報を表示して募集',
                            value: '```/リグマ募集 next 募集人数 参加メンバー 参加条件があれば記載```\n',
                        },
                        {
                            name: '現在のナワバリ情報を表示して募集',
                            value: '```/ナワバリ募集 now 募集人数 参加条件があれば記載```\n',
                        },
                        {
                            name: '次回のナワバリ情報を表示して募集',
                            value: '```/ナワバリ募集 next 募集人数 参加条件があれば記載```\n',
                        },
                        {
                            name: 'フェス募集コマンド',
                            value: '```/〇〇陣営 fes 募集人数 参加条件があれば記載```\n',
                        },
                        {
                            name: 'サーモンラン情報を表示して募集',
                            value: '```/サーモンラン募集 run 募集人数 参加条件があれば記載```\n',
                        },
                        {
                            name: '別ゲー募集コマンド',
                            value:
                                'Dead by Daylight：```/別ゲー募集 dbd 募集人数 参加条件があれば記載```\n' +
                                'VALORANT：```/別ゲー募集 valo 募集人数 参加条件があれば記載```\n' +
                                'モンスターハンターライズ：```/別ゲー募集 mhr 募集人数 参加条件があれば記載```\n' +
                                'ApexLegends：```/別ゲー募集 apex 募集人数 参加条件があれば記載```\n' +
                                'その他:```/別ゲー募集 other ゲーム名 募集人数 参加条件があれば記載```\n',
                        },
                    ]),
            ],
        });
    }
};
