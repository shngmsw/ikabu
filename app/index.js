// Discord bot implements
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
} = require('@discordjs/voice');
const { Client, Intents, VoiceChannel } = require('discord.js');
const { URLSearchParams } = require('url');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
});
const Handler = require('./handler.js');
const Dispandar = require('./event/dispandar.js');
const TTS = require('./tts/voice_bot_node.js');
const privateChat = require('./voice/secretchat.js');
const handleStageInfo = require('./cmd/stageinfo.js');
const removeRookie = require('./event/rookie.js');
const chatCountUp = require('./event/members.js');
const suggestionBox = require('./reaction/suggestion-box.js');
const join = require('./event/join.js');
const deleteToken = require('./event/delete_token.js');
const recruitButton = require('./event/recruit_button.js');
const handleIkabuExperience = require('./cmd/experience.js');
client.login(process.env.DISCORD_BOT_TOKEN);

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) {
        if (msg.content.startsWith('/poll')) {
            if (msg.author.username === 'ブキチ') {
                console.log(msg.author.username);
                msg.delete();
            }
        }
        // ステージ情報
        if (msg.content === 'stageinfo') {
            handleStageInfo(msg);
        }
        return;
    }
    if (msg.content.match('ボーリング')) {
        msg.reply(
            '```「ボウリング」とは、前方に正三角形に並べられた10本のピンと呼ばれる棒をめがけボールを転がし、倒れたピンの数によって得られる得点を競うスポーツでし。' +
                '専用施設のボウリング場に設置された細長いレーンの上で行われる屋内競技で、レーンの長さが約23m、ピンまでの距離は約18mで行われるのが一般的でし。' +
                '英語では “bowling” と書き、球を意味する “ball” ではなく、ラテン語で「泡」や「こぶ」を意味する “bowl” が語源とされているでし。' +
                '\n文部科学省は国語審議会で、球技を指す場合は「ボウリング」表記を用い、掘削を意味する「ボーリング」と区別することを推奨しているでし。```',
        );
    }

    deleteToken(msg);
    Handler.call(msg);
    Dispandar.dispand(msg);
    TTS.main(msg);
    suggestionBox.archive(msg);
    suggestionBox.init(msg);
    chatCountUp(msg);
    removeRookie(msg);
    if (msg.mentions.has(client.user) && msg.content.includes('イカ部歴')) {
        handleIkabuExperience(msg);
    }
});

client.on('guildMemberAdd', (member) => {
    join(member);
});

client.on('guildMemberRemove', (member) => {
    const guild = member.guild;
    const period = Math.round((Date.now() - member.joinedAt) / 86400000); // サーバーに居た期間を日数にして計算
    guild.channels.cache
        .find((channel) => channel.id === process.env.CHANNEL_ID_RETIRE_LOG)
        .send(`${member.user.tag}さんが退部しました。入部期間：${period}日間`);
});

client.on('voiceStateUpdate', (oldState, newState) => privateChat.onVoiceStateUpdate(oldState, newState));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // ready後にready以前に実行されたinteractionのinteractionCreateがemitされるが、
    // そのときにはinteractionがtimeoutしておりfollowupで失敗することがよくある。
    // そのようなことを避けるためready内でハンドラを登録する。
    client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => console.error(err)));
});

client.on('messageReactionAdd', async (reaction, user) => {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }
    if (reaction.message.channel.id === process.env.CHANNEL_ID_SUGGESTION_BOX) {
        if (reaction.emoji.name == '📭' && user.bot == false) {
            suggestionBox.create(reaction.message, user);
            reaction.remove();
            reaction.message.react('📭');
        } else if (reaction.emoji.name != '📭' && user.bot == false) {
            reaction.remove();
        }
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (!user.bot) {
    }
});

// buttonごとに呼び出すファンクション
const buttons = {
    jr: recruitButton.join,
    cr: recruitButton.cancel,
    close: recruitButton.close,
};
/**
 *
 * @param {Discord.Interaction} interaction
 */
async function onInteraction(interaction) {
    if (!interaction.isButton()) {
        return;
    }
    const params = new URLSearchParams(interaction.customId);
    await buttons[params.get('d')](interaction, params);
}
client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => console.error(err)));
