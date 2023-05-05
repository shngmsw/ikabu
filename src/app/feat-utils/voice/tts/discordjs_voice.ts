import {
    joinVoiceChannel,
    entersState,
    createAudioResource,
    StreamType,
    createAudioPlayer,
    AudioPlayerStatus,
    generateDependencyReport,
} from '@discordjs/voice';
import { isNotEmpty, notExists } from '../../../common/others';
import { log4js_obj } from '../../../../log4js_settings';
const infoLogger = log4js_obj.getLogger('info');
const interactionLogger = log4js_obj.getLogger('interaction');
const logger = log4js_obj.getLogger('voice');

infoLogger.info(generateDependencyReport());
import { mode_api, bufferToStream } from './voice_bot_node';

// ボイスチャットセッション保存用のMapです。
const subscriptions = new Map();
// 読み上げ対象のDicordチャンネル保存用のMapです。
const channels = new Map();

const join = async (interaction: $TSFixMe) => {
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
            connection.on('error', (error: $TSFixMe) => {
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

const kill = async (interaction: $TSFixMe) => {
    try {
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;
        const subscription = subscriptions.get(guildId);
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

export async function autokill(oldState: $TSFixMe) {
    const guildId = oldState.guild.id;
    const channelId = oldState.channel.id;
    const oldChannel = await oldState.guild.channels.fetch(oldState.channelId);
    const subscription = subscriptions.get(guildId);
    if (isNotEmpty(subscription) && channels.get(guildId) === channelId) {
        if (oldChannel.members.size != 1) {
            return;
        }
        subscription.connection.destroy();
        subscriptions.delete(guildId);
        channels.delete(guildId);
        await oldState.channel.send(':dash:');
    }
}

export async function handleVoiceCommand(interaction: $TSFixMe) {
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

export async function play(msg: $TSFixMe) {
    try {
        const { guildId, channelId } = msg;
        const subscription = subscriptions.get(guildId);
        if (isNotEmpty(subscription) && channels.get(guildId) === channelId) {
            // メッセージから音声ファイルを取得
            const buffer = await mode_api(msg);
            if (notExists(buffer)) return;
            const stream = bufferToStream(buffer);

            // ボイスチャットセッションの音声プレイヤーに音声ファイルのURLを指定して再生させます。
            const player = subscription.player;
            const resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary,
            });

            player.play(resource);
            await entersState(player, AudioPlayerStatus.Idle, 1000 * 900);
        }
    } catch (error: $TSFixMe) {
        logger.warn(error);
        logger.warn(error.code);
        logger.warn(error.message);
    }
}
