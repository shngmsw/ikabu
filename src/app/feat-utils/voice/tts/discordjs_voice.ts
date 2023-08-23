import {
    joinVoiceChannel,
    entersState,
    createAudioResource,
    StreamType,
    createAudioPlayer,
    AudioPlayerStatus,
    generateDependencyReport,
} from '@discordjs/voice';
import {
    ButtonInteraction,
    CacheType,
    ChatInputCommandInteraction,
    Message,
    VoiceState,
} from 'discord.js';

import { modeApi, bufferToStream } from './voice_bot_node';
import { log4js_obj } from '../../../../log4js_settings';
import { searchAPIMemberById } from '../../../common/manager/member_manager';
import { exists, getDeveloperMention, isNotEmpty, notExists } from '../../../common/others';

const infoLogger = log4js_obj.getLogger('info');
const interactionLogger = log4js_obj.getLogger('interaction');
const logger = log4js_obj.getLogger('voice');

infoLogger.info(generateDependencyReport());

// ボイスチャットセッション保存用のMapです。
const subscriptions = new Map();
// 読み上げ対象のDicordチャンネル保存用のMapです。
const channels = new Map();

export const joinTTS = async (
    interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction<'cached' | 'raw'>,
) => {
    try {
        if (!interaction.inCachedGuild()) return;
        const guildId = interaction.guildId;
        const channelId = interaction.channelId;
        const member = await searchAPIMemberById(interaction.guild, interaction.member.user.id);

        if (notExists(interaction.channel) || !interaction.channel.isVoiceBased()) return;

        let subscription = subscriptions.get(guildId);
        if (!subscription) {
            if (notExists(member)) {
                return await interaction.channel.send(
                    getDeveloperMention() + 'メンバー情報が取得できなかったでし！',
                );
            }
            if (!member.voice.channelId) {
                // メンバーがVCにいるかチェック
                return await interaction.editReply('ボイチャに参加してからコマンドを使うでし！');
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
            await interaction.channel.send(
                'ボイスチャンネルに接続したでし！`/help voice`で使い方を説明するでし！',
            );
            await interaction.deleteReply();
        } else if (channels.get(guildId) === channelId) {
            await interaction.editReply('既に接続済みでし！');
        } else {
            await interaction.editReply('他の部屋で営業中でし！');
        }
    } catch (error) {
        await killTTS(interaction);
        interactionLogger.error(error);
    }
};

export const killTTS = async (
    interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction<'cached' | 'raw'>,
) => {
    try {
        const guildId = interaction.guildId;
        const channelId = interaction.channelId;
        const subscription = subscriptions.get(guildId);

        if (notExists(interaction.channel) || !interaction.channel.isVoiceBased()) return;

        if (subscription && channels.get(guildId) === channelId) {
            subscription.connection.destroy();
            subscriptions.delete(guildId);
            channels.delete(guildId);
            await interaction.channel.send(':dash:');
            await interaction.deleteReply();
        } else if (channels.get(guildId) != channelId) {
            await interaction.editReply('他の部屋で営業中でし！');
        }
    } catch (error) {
        interactionLogger.error(error);
    }
};

export async function autokill(oldState: VoiceState) {
    if (notExists(oldState.channel)) return;
    const guildId = oldState.guild.id;
    const channelId = oldState.channel.id;
    const oldChannel = await oldState.guild.channels.fetch(oldState.channel.id);
    const subscription = subscriptions.get(guildId);
    if (exists(subscription) && channels.get(guildId) === channelId && exists(oldChannel)) {
        if (oldChannel.isVoiceBased() && oldChannel.members.size != 1) {
            return;
        }
        subscription.connection.destroy();
        subscriptions.delete(guildId);
        channels.delete(guildId);
        await oldState.channel.send(':dash:');
    }
}

export async function handleVoiceCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    try {
        if (!interaction.isCommand()) return;
        const { options } = interaction;
        const subCommand = options.getSubcommand();
        switch (subCommand) {
            case 'join':
                await joinTTS(interaction);
                break;
            case 'kill':
                await killTTS(interaction);
                break;
        }
    } catch (error) {
        interactionLogger.error(error);
    }
}

export async function play(msg: Message<true>) {
    try {
        const { guildId, channelId } = msg;
        const subscription = subscriptions.get(guildId);
        if (
            exists(subscription) &&
            isNotEmpty(subscription) &&
            channels.get(guildId) === channelId
        ) {
            // メッセージから音声ファイルを取得
            const buffer = await modeApi(msg);
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
    } catch (error) {
        logger.warn(error);
    }
}
