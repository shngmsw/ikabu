/**
 * MIT License
 * Copyright (c) 2020 noriokun4649
 */
module.exports = {
    setting: setting,
    mode_api: mode_api,
    messageReplace: messageReplace,
    bufferToStream: bufferToStream,
};

const { VoiceText } = require('voice-text');
const { Readable } = require('stream');
const conf = require('config-reloadable');

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
let voiceTextApiKey = null;
let prefix = '/';
let autoRestart = true;
let readMe = false;
let apiType = 1;
let voiceType = 'haruka';
let blackList;
let speed = 100;
let pitch = 100;
const timeoutOffset = 5;

readConfig();
let voicePattern1 = voiceType; //初期時のよみあげ音声
let mode = apiType;
const voiceText = new VoiceText(voiceTextApiKey); //Voice Text API key

function readConfig() {
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
}

async function mode_api(msg) {
    if (mode === 1) {
        // ユーザーによって音声変える
        let selectPitch = msg.author.id.substr(17, 1);
        let selectSpeed = msg.author.id.substr(16, 1);
        const replacedMessage = await messageReplace(msg);
        pitch = pitchList[selectPitch];
        speed = speedList[selectSpeed];
        return voiceText.fetchBuffer(replacedMessage, {
            format: 'wav',
            speaker: voicePattern1,
            pitch,
            speed,
        });
    } else {
        throw Error(`不明なAPIが選択されています:${mode}`);
    }
}

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

async function messageReplace(message) {
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

    const over200_cut = (str) => {
        if (str.length > 200) {
            const str200 = str.substr(0, 195) + '以下略';
            return str200;
        } else {
            return str;
        }
    };

    const yomiage_message = await mention_replace(w_replace(over200_cut(emoji_delete(url_delete(`${message.content}`)))));
    return yomiage_message;
}

async function setting(message) {
    if (!message.guild) return;

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
}
