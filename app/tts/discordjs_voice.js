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

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const infoLogger = log4js.getLogger();
const interactionLogger = log4js.getLogger('interaction');
const logger = log4js.getLogger('voice');

infoLogger.info(generateDependencyReport());
const { mode_api, bufferToStream } = require('./voice_bot_node');

// ボイスチャットセッション保存用のMapです。
const subscriptions = new Map();
// 読み上げ対象のDicordチャンネル保存用のMapです。
const channels = new Map();

module.exports = {
    handleVoiceCommand: handleVoiceCommand,
    play: play,
};

const join = async (interaction) => {
    try {
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
            connection.on('error', (error) => {
                logger.warn(error);
            });
            subscriptions.set(guildId, subscription);
            channels.set(guildId, channelId);
            await interaction.followUp('ボイスチャンネルに接続したでし！`/help voice`で使い方を説明するでし！');
        } else if (channels.get(guildId) === channelId) {
            await interaction.followUp('既に接続済みでし！');
        } else {
            await interaction.followUp('他の部屋で営業中でし！');
        }
    } catch (error) {
        kill(interaction);
        interactionLogger.error(error);
    }
};

const kill = async (interaction) => {
    try {
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
    } catch (error) {
        interactionLogger.error(error);
    }
};

async function handleVoiceCommand(interaction) {
    try {
        if (!interaction.isCommand()) return;
        const { options } = interaction;
        const subCommand = options.getSubcommand();
        switch (subCommand) {
            case 'join':
                join(interaction);
                break;
            case 'kill':
                kill(interaction);
                break;
        }
    } catch (error) {
        interactionLogger.error(error);
    }
}

async function play(msg) {
    try {
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
    } catch (error) {
        logger.error(error);
    }
}
