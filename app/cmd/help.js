const { MessageEmbed } = require('discord.js');

module.exports = function handleHelp(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = strCmd.replace('  ', ' ');
    const args = strCmd.split(' ');
    args.shift();
    if (args[0] == 'voice') {
        msg.channel.send({
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
                            value: '```!join```\n',
                        },
                        {
                            name: 'ボイスチャンネルへ再接続',
                            value: '```!reconnect```\n',
                        },
                        {
                            name: 'APIで利用可能な音声タイプを一覧表示します',
                            value: '```!type```\n',
                        },
                        {
                            name: '音声タイプを変更します',
                            value: '```!voice```\n',
                        },
                    ]),
            ],
        });
    } else if (args[0] == '2') {
        msg.channel.send({
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
                            value: '```show ○○○```\n',
                        },
                        {
                            name: 'ランダム系コマンド',
                            value:
                                'ブキをランダムで選出：```buki 複数の場合は数字を記入```\n' +
                                'ブキ種別ごとのランダム選出方法を表示：```buki help```\n' +
                                'Choose a weapon randomly:```weapon```\n' +
                                'Choose a weapon randomly help:```weapon help```\n' +
                                'ガチルールをランダムで選出：```rule```\n' +
                                'ガチルールとステージをランダムで選出：```rule stage```\n' +
                                'サブウェポンをランダムで選出：```sub```\n' +
                                'スペシャルウェポンをランダムで選出：```special```',
                        },
                        {
                            name: '選択肢の中からランダム選出',
                            value: '```pick 複数選出の場合は数字を記入 選択肢を半スペ空け or 改行して記入```',
                        },
                        {
                            name: '接続してるボイチャから数字分のヒトをランダム抽出',
                            value: '```vpick 複数選出の場合は数字を記入```',
                        },
                        {
                            name: 'プラベの観戦者を抽出',
                            value: '```kansen 試合回数分の数字を記入```',
                        },
                        {
                            name: 'アンケートを実施(スペースで区切れば何個でも)',
                            value: '```poll 選択肢1 選択肢2```',
                        },
                        {
                            name: '自分のフレンドコードを表示',
                            value: '```fc @自分```\n「フレンドコード」チャンネルの直近100件に書いてあればそちらを優先します。',
                        },
                        {
                            name: '自分のイカ部歴を表示',
                            value: '```@ブキチ イカ部歴```\n',
                        },
                        {
                            name: 'wikipediaで調べる',
                            value: '```wiki 〇〇```',
                        },
                    ]),
            ],
        });
    } else {
        msg.channel.send({
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
                            value: '```help または help 2 または help voice```',
                        },
                        {
                            name: '現在のリグマ情報を表示して募集',
                            value: '```now 参加条件があれば記載```\n',
                        },
                        {
                            name: '次回のリグマ情報を表示して募集',
                            value: '```next 参加条件があれば記載```\n',
                        },
                        {
                            name: '現在のナワバリ情報を表示して募集',
                            value: '```nawabari 参加条件があれば記載```\n',
                        },
                        {
                            name: 'サーモンラン情報を表示して募集',
                            value: '```run 参加条件があれば記載```\n',
                        },
                        {
                            name: '別ゲー募集コマンド',
                            value:
                                'Dead by Daylight：```!dbd 参加条件があれば記載```\n' +
                                'モンスターハンターライズ：```!mhr 参加条件があれば記載```\n' +
                                'ApexLegends：```!apex 参加条件があれば記載```\n',
                        },
                    ]),
            ],
        });
    }
};
