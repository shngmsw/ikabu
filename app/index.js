// Discord bot implements
const { Client, Intents, VoiceChannel, MessageAttachment } = require('discord.js');
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
const VOICE_API = require('./tts/voice_bot_node.js');
const DISCORD_VOICE = require('./tts/discordjs_voice.js');
const handleStageInfo = require('./cmd/stageinfo.js');
const { getCloseEmbed, getCommandHelpEmbed } = require('./common.js');
const { otherGameRecruit } = require('./cmd/recruit/other_game_recruit.js');
const { regularRecruit } = require('./cmd/recruit/regular_recruit.js');
const { leagueRecruit } = require('./cmd/recruit/league_recruit.js');
const { salmonRecruit } = require('./cmd/recruit/salmon_recruit.js');
const { privateRecruit } = require('./cmd/recruit/private_recruit.js');
const removeRookie = require('./event/rookie.js');
const chatCountUp = require('./event/members.js');
const suggestionBox = require('./reaction/suggestion-box.js');
const join = require('./event/join.js');
const deleteToken = require('./event/delete_token.js');
const recruitButton = require('./event/recruit_button.js');
const handleIkabuExperience = require('./cmd/experience.js');
const { commandNames } = require('../constant');
const registerSlashCommands = require('../register.js');
const { voiceLocker, voiceLockerUpdate } = require('./cmd/voice_locker.js');
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
    if (msg.content.match('お前を消す方法')) {
        const Kairu = new MessageAttachment('./images/Kairu.png');
        msg.reply({ files: [Kairu] });
    }

    deleteToken(msg);
    Handler.call(msg);
    Dispandar.dispand(msg);
    VOICE_API.setting(msg);
    DISCORD_VOICE.handleVoiceCommand(msg);
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

client.on('guildMemberRemove', async (member) => {
    try {
        const guild = member.guild;
        const tag = member.user.tag;
        const period = Math.round((Date.now() - member.joinedAt) / 86400000); // サーバーに居た期間を日数にして計算
        const retire_log = await guild.channels.cache.find((channel) => channel.id === process.env.CHANNEL_ID_RETIRE_LOG);
        retire_log.send(`${tag} さんが退部しました。入部日: ${member.joinedAt} 入部期間：${period}日間`);
    } catch (err) {
        console.log(err);
    }
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // ready後にready以前に実行されたinteractionのinteractionCreateがemitされるが、
    // そのときにはinteractionがtimeoutしておりfollowupで失敗することがよくある。
    // そのようなことを避けるためready内でハンドラを登録する。
    // client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => console.error(err)));
    await registerSlashCommands();
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
    del: recruitButton.del,
    close: recruitButton.close,
    unl: recruitButton.unlock,
};
/**
 *
 * @param {Discord.Interaction} interaction
 */
async function onInteraction(interaction) {
    try {
        if (interaction.isButton()) {
            const customIds = ['voiceLock_inc', 'voiceLock_dec', 'voiceLockOrUnlock'];
            if (customIds.includes(interaction.customId)) {
                voiceLockerUpdate(interaction);
            } else {
                const params = new URLSearchParams(interaction.customId);
                await buttons[params.get('d')](interaction, params);
                return;
            }
        }
        if (interaction.isCommand()) {
            const { commandName } = interaction;

            if (commandName === commandNames.voice_channel && !(interaction.replied || interaction.deferred)) {
                await voiceLocker(interaction);
            } else if (commandName === commandNames.close) {
                //serverコマンド
                const embed = getCloseEmbed();
                if (!interaction.replied) {
                    await interaction.reply({
                        embeds: [embed, getCommandHelpEmbed(interaction.channel.name)],
                    });
                }
            } else if (commandName === commandNames.other_game) {
                await otherGameRecruit(interaction);
            } else if (commandName === commandNames.private) {
                await privateRecruit(interaction);
            } else if (commandName === commandNames.regular) {
                await regularRecruit(interaction);
            } else if (commandName === commandNames.league) {
                await leagueRecruit(interaction);
            } else if (commandName === commandNames.salmon) {
                await salmonRecruit(interaction);
            }
            return;
        }
    } catch (error) {
        const error_detail = {
            content: `Command failed: ${error}`,
            interaction_replied: interaction.replied,
            interaction_deferred: interaction.deferred,
        };
        console.log(error_detail);
    }
}
client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => console.error(err)));

client.on('voiceStateUpdate', (oldState, newState) => onVoiceStateUpdate(oldState, newState));
const pattern = /^[a-m]/;
// NOTE:VC切断時に0人になったら人数制限を0にする
async function onVoiceStateUpdate(oldState, newState) {
    // StateUpdateが同じチャンネルの場合は対象外
    if (oldState.channelId === newState.channelId) {
        return;
    }

    if (oldState.channelId != null) {
        const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
        // a～mから始まらない場合は対象外にする
        if (!oldChannel.name.match(pattern)) {
            return;
        }
        if (oldChannel.members.size == 0) {
            oldChannel.setUserLimit(0);
        }
    }
    if (newState.channelId != null) {
        const newChannel = newState.guild.channels.cache.get(newState.channelId);
        if (newChannel.members.size != 0) {
            newChannel.permissionOverwrites.delete(newState.guild.roles.everyone, 'UnLock Voice Channel');
            newChannel.permissionOverwrites.delete(newState.member, 'UnLock Voice Channel');
        }
    }
}
