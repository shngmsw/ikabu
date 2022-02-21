const {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    createAudioResource,
    StreamType,
    createAudioPlayer,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    generateDependencyReport,
} = require('@discordjs/voice');
console.log(generateDependencyReport());
const { mode_api, messageReplace, bufferToStream } = require('./voice_bot_node');

// ボイスチャットセッション保存用のMapです。
const subscriptions = new Map();
// 読み上げ対象のDicordチャンネル保存用のMapです。
const channels = new Map();

module.exports = {
    handleVoiceCommand: handleVoiceCommand
};

const join = async (msg) => {
    const { guildId, member, channelId } = msg;
    let subscription = subscriptions.get(guildId);
    if (!subscription) {
        // yoshi-taroがボイスチャンネルに入っていなければ参加
        if (!member.voice.channelId) {
            // メンバーがVCにいるかチェック
            msg.channel.send('ボイチャに参加した状態でコマンド叩いてね😘');
            return;
        }
        const connection = joinVoiceChannel({
            selfMute: false,
            channelId: member.voice.channelId,// メンバーが居るVCのチャンネル
            guildId: guildId,
            adapterCreator: member.voice.guild.voiceAdapterCreator,
        });
        subscription = connection.subscribe(createAudioPlayer());
        connection.on('error', console.warn);
        subscriptions.set(guildId, subscription);
        channels.set(guildId, channelId);
        msg.channel.send('ワイはヨシ太郎や！"$yoshi help"で使い方表示するで！');
    }
}

const play = async (msg) => {
    if (subscription) {
        // メッセージから音声ファイルを取得
        const replacedMessage = messageReplace(msg);
        const buffer = mode_api(replacedMessage);
        const stream = bufferToStream(buffer);

        // ボイスチャットセッションの音声プレイヤーに音声ファイルのURLを指定して再生させます。
        const player = subscription.player;
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
        });
        player.play(resource);
    }
}

const kill = async (msg) => {
    const { guildId } = msg;
    subscription.connection.destroy();
    subscriptions.delete(guildId);
    channels.delete(guildId);
    msg.channel.send(':dash:');
}

const handleVoiceCommand = (msg) => {
    let strCmd = content.replace(/ /g, ' ');
    const args = strCmd.split(' ');
    args.shift();
    const command = args.shift().toLowerCase();
    switch (command) {
        case 'join':
            join(msg);
            break;
        case 'kill':
            kill(msg);
            break;
        case 'play':
            play(msg);
            break;
    }
}
































async function play(message) {
    const guild = message.guild;
    const member = await guild.members.fetch(message.member.id);
    const memberVC = member.voice.channel;
    if (!memberVC) {
        return message.reply({
            content: '接続先のVCが見つかりません。',
        });
    }
    if (!memberVC.joinable) {
        return message.reply({
            content: 'VCに接続できません。',
        });
    }
    if (!memberVC.speakable) {
        return message.reply({
            content: 'VCで音声を再生する権限がありません。',
        });
    }
    const status = ['●Loading Sounds...', `●Connecting to ${memberVC}...`];
    const p = message.reply(status.join('\n'));
    const connection = joinVoiceChannel({
        guildId: guild.id,
        channelId: memberVC.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: false,
    });
    const resource = createAudioResource(bufferStream, {
        inputType: StreamType.Arbitrary,
    });
    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });
    player.play(resource);
    const promises = [];
    promises.push(entersState(player, AudioPlayerStatus.AutoPaused, 1000 * 10).then(() => (status[0] += 'Done!')));
    promises.push(entersState(connection, VoiceConnectionStatus.Ready, 1000 * 10).then(() => (status[1] += 'Done!')));
    await Promise.race(promises);
    await p;
    await Promise.all([...promises, message.reply(status.join('\n'))]);
    connection.subscribe(player);
    await entersState(player, AudioPlayerStatus.Playing, 100);

    await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
    connection.destroy();
}

async function onPlay(message) {
    try {
        await play(message);
    } catch (err) {
        if (message.replied) {
            message.edit('エラーが発生しました。').catch(() => { });
        } else {
            message.reply('エラーが発生しました。').catch(() => { });
        }
        throw err;
    }
}
