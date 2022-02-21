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
    handleVoiceCommand: handleVoiceCommand,
};

const join = async (msg) => {
    const { guildId, member, channelId } = msg;
    let subscription = subscriptions.get(guildId);
    if (!subscription) {
        // yoshi-taroがボイスチャンネルに入っていなければ参加
        if (!member.voice.channelId) {
            // メンバーがVCにいるかチェック
            msg.channel.send('ボイチャに参加してからコマンドを使うでし！');
            return;
        }
        const connection = joinVoiceChannel({
            selfMute: false,
            channelId: member.voice.channelId, // メンバーが居るVCのチャンネル
            guildId: guildId,
            adapterCreator: member.voice.guild.voiceAdapterCreator,
        });
        subscription = connection.subscribe(createAudioPlayer());
        connection.on('error', console.warn);
        subscriptions.set(guildId, subscription);
        channels.set(guildId, channelId);
        msg.channel.send('ボイスチャンネルに接続したでし！`help voice`で使い方を説明するでし！');
    }
};

const play = async (msg) => {
    const { guildId, member, channelId } = msg;
    let subscription = subscriptions.get(guildId);
    if (subscription) {
        // メッセージから音声ファイルを取得
        const buffer = await mode_api(msg);
        const stream = await bufferToStream(buffer);

        // ボイスチャットセッションの音声プレイヤーに音声ファイルのURLを指定して再生させます。
        const player = subscription.player;
        const resource = await createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
        });
        player.play(resource);
    }
};

const kill = async (msg) => {
    const { guildId } = msg;
    let subscription = subscriptions.get(guildId);
    subscription.connection.destroy();
    subscriptions.delete(guildId);
    channels.delete(guildId);
    msg.channel.send(':dash:');
};

function handleVoiceCommand(msg) {
    const { content } = msg;
    let strCmd = content.replace(/ /g, ' ');
    const args = strCmd.split(' ');
    const command = args.shift().toLowerCase();
    switch (command) {
        case '!join':
            join(msg);
            break;
        case '!kill':
            kill(msg);
            break;
        default:
            play(msg);
            break;
    }
}
