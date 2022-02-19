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
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_VOICE_STATES, //多分これでいい
});

module.exports = {
    onPlay: onPlay,
};

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
            message.edit('エラーが発生しました。').catch(() => {});
        } else {
            message.reply('エラーが発生しました。').catch(() => {});
        }
        throw err;
    }
}
