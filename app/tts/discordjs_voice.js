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
const log4js = require('log4js');

log4js.configure('config/log4js-config.json');
const logger = log4js.getLogger();

logger.info(generateDependencyReport());
const { mode_api, messageReplace, bufferToStream } = require('./voice_bot_node');

// ボイスチャットセッション保存用のMapです。
const subscriptions = new Map();
// 読み上げ対象のDicordチャンネル保存用のMapです。
const channels = new Map();

module.exports = {
    handleVoiceCommand: handleVoiceCommand,
    play: play,
};

const join = async (interaction) => {
    const guildId = interaction.guild.id;
    const channelId = interaction.channel.id;
    const member = interaction.member;

    let subscription = subscriptions.get(guildId);
    if (!subscription) {
        // yoshi-taroがボイスチャンネルに入っていなければ参加
        if (!member.voice.channelId) {
            // メンバーがVCにいるかチェック
            await interaction.followUp('ボイチャに参加してからコマンドを使うでし！');
            return;
        }
        const connection = joinVoiceChannel({
            selfMute: false,
            channelId: member.voice.channelId, // メンバーが居るVCのチャンネル
            guildId: guildId,
            adapterCreator: member.voice.guild.voiceAdapterCreator,
        });
        subscription = connection.subscribe(createAudioPlayer());
        connection.on('error', logger.warn(error));
        subscriptions.set(guildId, subscription);
        channels.set(guildId, channelId);
        await interaction.followUp('ボイスチャンネルに接続したでし！`/help voice`で使い方を説明するでし！');
    } else if (channels.get(guildId) === channelId) {
        await interaction.followUp('既に接続済みでし！');
    } else {
        await interaction.followUp('他の部屋で営業中でし！');
    }
};

const kill = async (interaction) => {
    const guildId = interaction.guild.id;
    const channelId = interaction.channel.id;
    let subscription = subscriptions.get(guildId);
    if (subscription && channels.get(guildId) === channelId) {
        subscription.connection.destroy();
        subscriptions.delete(guildId);
        channels.delete(guildId);
        await interaction.followUp(':dash:');
    } else if (channels.get(guildId) != channelId) {
        await interaction.followUp('他の部屋で営業中でし！');
    }
};

async function handleVoiceCommand(interaction) {
    if (!interaction.isCommand()) return;
    const { options } = interaction;
    const subCommand = options.getSubcommand();
    try {
        switch (subCommand) {
            case 'join':
                join(interaction);
                break;
            case 'kill':
                kill(interaction);
                break;
        }
    } catch (err) {
        kill(interaction);
    }
}

async function play(msg) {
    const { guildId, channelId } = msg;
    let subscription = subscriptions.get(guildId);
    if (subscription && channels.get(guildId) === channelId) {
        // メッセージから音声ファイルを取得
        const buffer = await mode_api(msg);
        if (buffer == null) return;
        const stream = bufferToStream(buffer);

        // ボイスチャットセッションの音声プレイヤーに音声ファイルのURLを指定して再生させます。
        const player = subscription.player;
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
        });

        player.play(resource);
        await entersState(player, AudioPlayerStatus.Idle, 1000 * 900);
    }
}
