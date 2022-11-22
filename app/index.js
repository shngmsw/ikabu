// Discord bot implements
const { Client, GatewayIntentBits, PermissionsBitField, ActivityType } = require('discord.js');
const { URLSearchParams } = require('url');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

const Handler = require('./handler.js');
const Dispandar = require('./event/dispandar.js');
const VOICE_API = require('./tts/voice_bot_node.js');
const DISCORD_VOICE = require('./tts/discordjs_voice.js');
const handleStageInfo = require('./cmd/splat3/stageinfo.js');
const { isNotEmpty, getCloseEmbed, getCommandHelpEmbed } = require('./common.js');
const { otherGameRecruit } = require('./cmd/other/recruit/other_game_recruit.js');
const { regular2Recruit } = require('./cmd/splat2/recruit/regular_recruit.js');
const { regularRecruit } = require('./cmd/splat3/recruit/regular_recruit.js');
const { fesRecruit } = require('./cmd/splat3/recruit/fes_recruit');
const { leagueRecruit } = require('./cmd/splat2/recruit/league_recruit.js');
const { anarchyRecruit } = require('./cmd/splat3/recruit/anarchy_recruit.js');
const { salmon2Recruit } = require('./cmd/splat2/recruit/salmon_recruit.js');
const { salmonRecruit } = require('./cmd/splat3/recruit/salmon_recruit.js');
const { private2Recruit } = require('./cmd/splat2/recruit/private_recruit.js');
const { privateRecruit } = require('./cmd/splat3/recruit/private_recruit.js');
const { ButtonEnable } = require('./cmd/admin-cmd/enableButton');
const { voiceMention } = require('./cmd/other/voice_mention.js');
const removeRookie = require('./event/rookie.js');
const chatCountUp = require('./event/members.js');
const join = require('./event/join.js');
const deleteToken = require('./event/delete_token.js');
const recruitButton = require('./event/recruit_button.js');
const divider = require('./cmd/other/team_divider/divider');
const handleIkabuExperience = require('./cmd/other/experience.js');
const { commandNames } = require('../constant');
const registerSlashCommands = require('../register.js');
const { voiceLocker, voiceLockerUpdate } = require('./cmd/other/voice_locker.js');
const { handleFriendCode, deleteFriendCode } = require('./cmd/other/friendcode.js');
const DBCommon = require('../db/db.js');
const RecruitService = require('../db/recruit_service.js');
const TeamDividerService = require('../db/team_divider_service.js');
const log4js = require('log4js');
client.login(process.env.DISCORD_BOT_TOKEN);

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger();

client.on('messageCreate', async (msg) => {
    try {
        if (msg.author.bot) {
            if (msg.content.startsWith('/poll')) {
                if (msg.author.username === 'ブキチ') {
                    logger.info(msg.author.username);
                    msg.delete();
                }
            }
            // ステージ情報
            if (msg.content === 'stageinfo') {
                handleStageInfo(msg);
            }
            return;
        } else {
            // ステージ情報デバッグ用
            if (msg.content === 'stageinfo') {
                const guild = await msg.guild.fetch();
                const member = await guild.members.fetch(msg.author.id, {
                    force: true, // intentsによってはGuildMemberUpdateが配信されないため
                });
                if (member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    handleStageInfo(msg);
                }
            }
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
            const Kairu = new AttachmentBuilder('./images/Kairu.png');
            msg.reply({ files: [Kairu] });
        }

        await deleteToken(msg);
        Handler.call(msg);
        Dispandar.dispand(msg);
        DISCORD_VOICE.play(msg);
        await chatCountUp(msg);
        removeRookie(msg);
    } catch (error) {
        const messageLogger = log4js.getLogger('message');
        messageLogger.error(error);
    }
});

client.on('guildMemberAdd', async (member) => {
    try {
        join(member);
        const guild = await member.guild.fetch();
        if (guild.id === process.env.SERVER_ID) {
            client.user.setActivity(`${guild.memberCount}人`, {
                type: ActivityType.Playing,
            });
        }
    } catch (error) {
        const loggerMA = log4js.getLogger('guildMemberAdd');
        loggerMA.error(error);
    }
});

client.on('guildMemberRemove', async (member) => {
    try {
        const tag = member.user.tag;
        const period = Math.round((Date.now() - member.joinedAt) / 86400000); // サーバーに居た期間を日数にして計算
        const retire_log = member.guild.channels.cache.get(process.env.CHANNEL_ID_RETIRE_LOG);
        if (retire_log != null) {
            retire_log.send(`${tag} さんが退部しました。入部日: ${member.joinedAt} 入部期間：${period}日間`);
        }
        const guild = await member.guild.fetch();
        if (guild.id === process.env.SERVER_ID) {
            client.user.setActivity(`${guild.memberCount}人`, {
                type: ActivityType.Playing,
            });
        }
    } catch (err) {
        const loggerMR = log4js.getLogger('guildMemberRemove');
        loggerMR.error({ err });
    }
});

client.on('ready', async () => {
    try {
        logger.info(`Logged in as ${client.user.tag}!`);
        // ready後にready以前に実行されたinteractionのinteractionCreateがemitされるが、
        // そのときにはinteractionがtimeoutしておりfollowupで失敗することがよくある。
        // そのようなことを避けるためready内でハンドラを登録する。
        // client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => logger.error(err)));
        await registerSlashCommands();
        DBCommon.init();
        await RecruitService.createTableIfNotExists();
        await TeamDividerService.createTableIfNotExists();
        const guild = client.user.client.guilds.cache.get(process.env.SERVER_ID);
        client.user.setActivity(`${guild.memberCount}人`, { type: ActivityType.Playing });
    } catch (error) {
        logger.error(error);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    const loggerMRA = log4js.getLogger('messageReactionAdd');
    try {
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                loggerMRA.error('Something went wrong when fetching the message:', error);
                return;
            }
        }
    } catch (error) {
        loggerMRA.error(error);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (!user.bot) {
        }
    } catch (error) {
        const loggerMRR = log4js.getLogger('messageReactionRemove');
        loggerMRR.error(error);
    }
});

/**
 *
 * @param {Discord.Interaction} interaction
 */
async function onInteraction(interaction) {
    try {
        if (interaction.isButton()) {
            const params = new URLSearchParams(interaction.customId);
            const voiceLockerIds = ['voiceLock_inc', 'voiceLock_dec', 'voiceLockOrUnlock'];
            if (voiceLockerIds.includes(interaction.customId)) {
                voiceLockerUpdate(interaction);
            } else if (interaction.customId == 'fchide') {
                deleteFriendCode(interaction);
            } else if (isNotEmpty(params.get('d'))) {
                // buttonごとに呼び出すファンクション
                const recruitButtons = {
                    jr: recruitButton.join,
                    cr: recruitButton.cancel,
                    del: recruitButton.del,
                    close: recruitButton.close,
                    unl: recruitButton.unlock,
                    njr: recruitButton.joinNotify,
                    ncr: recruitButton.cancelNotify,
                    nclose: recruitButton.closeNotify,
                };
                await recruitButtons[params.get('d')](interaction, params);
            } else if (isNotEmpty(params.get('t'))) {
                const dividerButtons = {
                    join: divider.joinButton,
                    register: divider.registerButton,
                    cancel: divider.cancelButton,
                    alfa: divider.alfaButton,
                    bravo: divider.bravoButton,
                    spectate: divider.spectateButton,
                    end: divider.endButton,
                    correct: divider.correctButton,
                    hide: divider.hideButton,
                };
                await dividerButtons[params.get('t')](interaction, params);
            }
            return;
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
            } else if (commandName === commandNames.team_divider) {
                await divider.dividerInitialMessage(interaction);
            } else if (commandName === commandNames.regular) {
                if (interaction.channel.parentId == process.env.CATEGORY_SPLAT2_ID) {
                    await regular2Recruit(interaction);
                } else {
                    await regularRecruit(interaction);
                }
            } else if (commandName === commandNames.other_game) {
                await otherGameRecruit(interaction);
            } else if (commandName === commandNames.anarchy) {
                await anarchyRecruit(interaction);
            } else if (commandName === commandNames.private) {
                if (interaction.channel.parentId == process.env.CATEGORY_SPLAT2_ID) {
                    await private2Recruit(interaction);
                } else {
                    await privateRecruit(interaction);
                }
            } else if (commandName === commandNames.league) {
                await leagueRecruit(interaction);
            } else if (commandName === commandNames.fesA) {
                await fesRecruit(interaction);
            } else if (commandName === commandNames.fesB) {
                await fesRecruit(interaction);
            } else if (commandName === commandNames.fesC) {
                await fesRecruit(interaction);
            } else if (commandName === commandNames.salmon) {
                if (interaction.channel.parentId == process.env.CATEGORY_SPLAT2_ID) {
                    await salmon2Recruit(interaction);
                } else {
                    await salmonRecruit(interaction);
                }
            } else if (commandName === commandNames.friend_code) {
                await handleFriendCode(interaction);
            } else if (commandName === commandNames.experience) {
                handleIkabuExperience(interaction);
            } else if (commandName === commandNames.buttonEnable) {
                ButtonEnable(interaction);
            } else if (commandName === commandNames.voiceChannelMention) {
                voiceMention(interaction);
            } else if (commandName === commandNames.voice) {
                // 'インタラクションに失敗'が出ないようにするため
                await interaction.deferReply();
                DISCORD_VOICE.handleVoiceCommand(interaction);
                VOICE_API.setting(interaction);
            } else {
                Handler.call(interaction);
            }
            return;
        }
    } catch (error) {
        const interactionLogger = log4js.getLogger('interaction');
        const error_detail = {
            content: `Command failed: ${error}`,
            interaction_replied: interaction.replied,
            interaction_deferred: interaction.deferred,
        };
        interactionLogger.error(error_detail);
    }
}
client.on('interactionCreate', (interaction) => onInteraction(interaction));

client.on('voiceStateUpdate', (oldState, newState) => onVoiceStateUpdate(oldState, newState));
const pattern = /^[a-m]/;
// NOTE:VC切断時に0人になったら人数制限を0にする
async function onVoiceStateUpdate(oldState, newState) {
    try {
        // StateUpdateが同じチャンネルの場合は対象外
        if (oldState.channelId === newState.channelId) {
            return;
        }

        if (oldState.channelId != null) {
            const oldChannel = await oldState.guild.channels.fetch(oldState.channelId);
            // a～mから始まらない場合は対象外にする
            if (!oldChannel.name.match(pattern)) {
                return;
            }
            if (oldChannel.members.size == 0) {
                oldChannel.setUserLimit(0);
            }
        }
        if (newState.channelId != null) {
            const newChannel = await newState.guild.channels.fetch(newState.channelId);
            if (newChannel.members.size != 0) {
                newChannel.permissionOverwrites.delete(newState.guild.roles.everyone, 'UnLock Voice Channel');
                newChannel.permissionOverwrites.delete(newState.member, 'UnLock Voice Channel');
            }
        }
    } catch (error) {
        const loggerVSU = log4js.getLogger('voiceStateUpdate');
        loggerVSU.error(error);
    }
}
