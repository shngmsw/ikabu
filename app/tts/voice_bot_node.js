/**
 * MIT License
 * Copyright (c) 2020 noriokun4649
 */
// const Discord = require('discord.js');
const { VoiceText } = require('voice-text');
const { Readable } = require('stream');
const conf = require('config-reloadable');
// const client = new Discord.Client();

let config = conf();
const voiceLists1 = {
    hikari: 'ひかり（女性）',
    haruka: 'はるか（女性）',
    takeru: 'たける（男性）',
    santa: 'サンタ',
    bear: '凶暴なクマ',
    show: 'ショウ（男性）',
};
const modeList1 = {
    1: 'HOYA VoiceText API',
};
const pitchList = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
const speedList = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
let context;
let discordToken = null;
let voiceTextApiKey = null;
let prefix = '/';
let autoRestart = true;
let readMe = false;
let apiType = 1;
let voiceType = 'haruka';
let blackList;
let channelHistory;
let speed = 100;
let pitch = 100;
const timeoutOffset = 5;
let timeout = timeoutOffset;

const readConfig = () => {
    //discordToken = config.get('Api.discordToken');
    discordToken = process.env.DISCORD_BOT_TOKEN;
    //voiceTextApiKey = config.get('Api.voiceTextApiKey');
    voiceTextApiKey = process.env.VOICE_TEXT_API_KEY;
    prefix = config.get('Prefix');
    autoRestart = config.get('AutoRestart');
    if (typeof autoRestart !== 'boolean') throw new Error('Require a boolean type.');
    readMe = config.get('ReadMe');
    if (typeof readMe !== 'boolean') throw new Error('Require a boolean type.');
    apiType = config.get('Defalut.apiType');
    if (!modeList1[apiType]) throw new Error('Unknown api.');
    voiceType = config.get('Defalut.voiceType');
    if (!voiceLists1[voiceType]) throw new Error('Unknown voice.');
    blackList = config.get('BlackLists');
    return true;
};

// const autoRestartFunc = () => {
//     //console.log(`${timeout}秒後に再接続処理開始`);
//     setTimeout(() => {
//         discordLogin();
//     }, timeout * 1000);
//     timeout *= 2;
// };

const voiceChanelJoin = async (channelId) => {
    channelHistory = channelId;
    await channelId
        .join()
        .then((connection) => {
            context = connection;
        })
        .catch((err) => {
            //console.log(err);
            return false;
        });
    return true;
};

// const onErrorListen = (error) => {
//     if (context && context.status !== 4) context.disconnect();
//     // client.destroy();
//     console.error(error.name);
//     console.error(error.message);
//     console.error(error.code);
//     console.error(error);
//     if (client.status != null) {
//         message.user.send(error, {code: true});
//     } else {
//         console.error('NOT CONNECT');
//         if (error.code === 'TOKEN_INVALID') process.exit(1);
//         autoRestart ? autoRestartFunc() : process.exit(1);
//     }
// };

// const discordLogin = async () => {
//     //console.log('DiscordBotログイン処理を実行');
//     await client.login(discordToken); //Discord login token
//     //console.log('DiscordBotログイン処理を完了');
//     //console.log('ボイスチャンネルへの接続を試行');
//     if (channelHistory && await voiceChanelJoin(channelHistory)) {
//         //console.log('ボイスチャンネルへ再接続成功');
//     } else {
//         //console.log('直前に接続していたボイスチャンネル無し');
//     }
//     timeout = timeoutOffset;
// };

readConfig();
let voicePattern1 = voiceType; //初期時のよみあげ音声
let mode = apiType;
const voiceText = new VoiceText(voiceTextApiKey); //Voice Text API key
let readChannelId = null;

module.exports = {
    main: main,
};
// discordLogin();

// process.on('uncaughtException', onErrorListen);

// process.on('unhandledRejection', onErrorListen);

// client.on('ready', () => {
//     //console.log('Bot準備完了');
// });

async function main(message) {
    if (!message.guild) return;

    const isBlackListsFromPrefixes = (cont) => {
        const prefixes = blackList.get('prefixes');
        return prefixes.find((prefix) => cont.indexOf(prefix) === 0);
    };

    const isBlackListsFromID = (menId) => {
        const memberIds = blackList.get('memberIds');
        return memberIds.find((id) => menId === id);
    };

    const isBot = () => {
        const bots = blackList.get('bots');
        return bots ? message.author.bot : false;
    };

    const isRead = (id) => (readMe === false ? id === readChannelId : readMe);

    const isNotEmpty = (message) => (message.length === 0 ? false : true);

    const isNotLengthOver = (message) => (message.length >= 200 ? false : true);

    const w_replace = (str) => {
        const judge = /.*w$/g;
        if (str.match(judge)) {
            const pat = /(w)/g;
            return str.replace(pat, 'わらあた');
        }
        return str;
    };

    const url_delete = (str) => {
        const pat = /(https?:\/\/[\x21-\x7e]+)/g;
        return str.replace(pat, ' URL省略。');
    };

    const emoji_delete = (str) => {
        const pat = /(<:\w*:\d*>)/g;
        return str.replace(pat, '');
    };

    const mention_replace = (str) => {
        const pat = /<@!(\d*)>/g;
        const [matchAllElement] = str.matchAll(pat);
        if (matchAllElement === undefined) return str;
        return str.replace(pat, message.mentions.users.first().username);
    };

    const yomiage = (obj) => {
        if (obj.cons && obj.cons.status === 0 && message.guild.id === context.channel.guild.id) {
            mode_api(obj)
                .then((buffer) => {
                    obj.cons.play(bufferToStream(buffer)); //保存されたWAV再生
                    //console.log(`${obj.message}の読み上げ完了`);
                })
                .catch((error) => {
                    //console.log('error ->');
                    console.error(error);
                    message.channel.send({
                        content: `${modeList1[mode]}の呼び出しにエラーが発生したでし\nエラー内容:${error.details[0].message}`,
                    });
                });
        } else {
            //console.log('Botがボイスチャンネルへ接続してません。');
        }
    };

    const mode_api = (obj) => {
        if (mode === 1) {
            return voiceText.fetchBuffer(obj.message, {
                format: 'wav',
                speaker: voicePattern1,
                pitch,
                speed,
            });
        } else {
            throw Error(`不明なAPIが選択されています:${mode}`);
        }
    };

    const bufferToStream = (buffer) => {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        return stream;
    };

    if (message.content === `${prefix}join`) {
        if (message.member.voice.channel) {
            if (!context || (context && context.status === 4)) {
                if (voiceChanelJoin(message.member.voice.channel)) {
                    //console.log('ボイスチャンネルへ接続したでし');
                    message.channel.send('ボイスチャンネルへ接続したでし');
                    message.reply(
                        `\nチャットの読み上げ準備ができたでし。切断時は${prefix}killでし\n${prefix}mode で読み上げAPIを変更できるでし\。\n ${prefix}voiceで読み上げ音声を選択できるでし。\n 音声が読み上げられない場合は${prefix}reconnectを試してみるでし。`,
                    );
                    readChannelId = message.channel.id;
                }
            } else {
                message.reply('既にボイスチャンネルへ接続済みでし');
            }
        } else {
            message.reply('まずあなたがボイスチャンネルへ接続している必要があるでし');
        }
    }

    if (message.content === `${prefix}reconnect`) {
        if (context && context.status !== 4) {
            context.disconnect();
            message.channel.send('5秒後にボイスチャンネルへ再接続するでし');
            if (message.member.voice.channel) {
                setTimeout(() => {
                    if (voiceChanelJoin(message.member.voice.channel)) {
                        //console.log('ボイスチャンネルへ再接続したでし');
                        message.channel.send('ボイスチャンネルへ再接続したでし');
                        readChannelId = message.channel.id;
                    }
                }, 5000);
            } else {
                message.reply('まずあなたがボイスチャンネルへ接続している必要があるでし');
            }
        } else {
            message.reply('Botはボイスチャンネルに接続していないようでし');
        }
    }

    if (message.content === `${prefix}kill`) {
        if (context && context.status !== 4) {
            context.disconnect();
            message.channel.send(':dash:');
        } else {
            message.reply('Botはボイスチャンネルに接続していないようでし');
        }
    }

    if (message.content.indexOf(`${prefix}mode`) === 0) {
        const split = message.content.split(' ');
        if (1 < split.length) {
            if (modeList1[split[1]] != null) {
                mode = Number(split[1]);
                const modeMessage = `読み上げAPIを${split[1]} : ${modeList1[split[1]]}に設定したでし`;
                message.reply(modeMessage);
                yomiage({
                    message: modeMessage,
                    cons: context,
                });
            } else {
                mode = Number(split[1]);
                message.reply(`指定されたAPIが不正でし指定可能なAPIは${prefix}modeで見ることが可能でし`);
            }
        } else {
            let modeNames = `\n以下のAPIに切り替え可能でし 指定時の例：${prefix}mode 1\n`;
            for (const indexes in modeList1) {
                modeNames = `${modeNames + indexes} -> ${modeList1[indexes]}\n`;
            }
            message.reply(modeNames);
        }
    }

    if (message.content === `${prefix}type`) {
        let typeMessage = '\n音声タイプ -> その説明\n';
        if (mode === 1) {
            for (const voiceLists1Key in voiceLists1) {
                typeMessage = `${typeMessage + voiceLists1Key}->${voiceLists1[voiceLists1Key]}\n`;
            }
        } else {
            typeMessage = `${typeMessage}APIが不正でし`;
        }
        message.reply(typeMessage);
    }

    if (message.content.indexOf(`${prefix}voice`) === 0) {
        const split = message.content.split(' ');
        if (mode === 1) {
            if (1 < split.length) {
                if (voiceLists1[split[1]] != null) {
                    voicePattern1 = split[1];
                    const voiceMessage = `読み上げ音声を${split[1]} : ${voiceLists1[split[1]]}に設定したでし`;
                    message.reply(voiceMessage);
                    yomiage({
                        message: voiceMessage,
                        cons: context,
                    });
                } else {
                    message.reply(`指定された読み上げ音声タイプが不正でし指定可能な音声タイプは${prefix}typeで見ることが可能でし`);
                }
            } else {
                message.reply(
                    `読み上げ音声タイプを指定する必要があるでし例：${prefix}voice hikari 指定可能な音声タイプは${prefix}typeで見ることが可能でし`,
                );
            }
        }
    }

    if (message.content === `${prefix}reload`) {
        config = conf.reloadConfigs();
        if (readConfig()) message.channel.send('コンフィグを再読み込みしたでし');
    }

    if (message.content.indexOf(`${prefix}pitch`) === 0) {
        const split = message.content.split(' ');
        if (mode === 1) {
            if (1 < split.length) {
                if (split[1] <= 200 && split[1] >= 50) {
                    pitch = Number(split[1]);
                    message.channel.send(`読み上げ音声の高さを${split[1]}に変更したでし`);
                } else {
                    message.reply('読み上げ音声の高さは 50 ～ 200 の範囲内で設定してほしいでし');
                }
            }
        }
    }

    if (message.content.indexOf(`${prefix}speed`) === 0) {
        const split = message.content.split(' ');
        if (mode === 1) {
            if (1 < split.length) {
                if (split[1] <= 200 && split[1] >= 50) {
                    speed = Number(split[1]);
                    message.channel.send(`読み上げ音声の速度を${split[1]}に変更したでし`);
                } else {
                    message.reply('読み上げ音声の速度は 50 ～ 200 の範囲内で設定してほしいでし');
                }
            }
        }
    }

    const yomiage_message = await mention_replace(w_replace(emoji_delete(url_delete(`${message.content}`))));

    if (
        !(isBot() || isBlackListsFromID(message.member.id) || isBlackListsFromPrefixes(message.content)) &&
        isRead(message.channel.id) &&
        isNotEmpty(yomiage_message) &&
        isNotLengthOver(yomiage_message)
    ) {
        try {
            // ユーザーによって音声変える
            let selectPitch = message.author.id.substr(17, 1);
            let selectSpeed = message.author.id.substr(16, 1);
            pitch = pitchList[selectPitch];
            speed = speedList[selectSpeed];
            yomiage({
                message: yomiage_message,
                cons: context,
            });
        } catch (error) {
            //console.log(error.message);
            message.channel.send(error.message);
        }
    } else {
        //console.log('読み上げ対象外のチャットでし');
    }
}
