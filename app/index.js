// Discord bot implements
const { Client, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
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
    partials: [Partials.User, Partials.GuildMember, Partials.Message, Partials.Reaction],
    restRequestTimeout: 60000,
});

const MessageHandler = require('./handlers/message_handler');
const CommandHandler = require('./handlers/command_handler');
const ModalHandler = require('./handlers/modal_handler');
const ButtonHandler = require('./handlers/button_handler');
const ContextMenuHandler = require('./handlers/context_handler');
const VCStateUpdateHander = require('./handlers/VCState_update_handler');
const { isNotEmpty } = require('./common/others');
const emojiCountUp = require('./event/reactions.js');
const { guildMemberAddEvent } = require('./event/rookie/set_rookie.js');
const registerSlashCommands = require('../register.js');
const DBCommon = require('../db/db.js');
const RecruitService = require('../db/recruit_service.js');
const TeamDividerService = require('../db/team_divider_service.js');
const log4js = require('log4js');
const FriendCodeService = require('../db/friend_code_service.js');
const MembersService = require('../db/members_service.js');
const { editThreadTag } = require('./event/support_auto_tag/edit_tag');
const { sendCloseButton } = require('./event/support_auto_tag/send_support_close_button');
const { updateSchedule } = require('./common/apis/splatoon3_ink.js');

client.login(process.env.DISCORD_BOT_TOKEN);

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger();

client.on('messageCreate', async (msg) => {
    MessageHandler.call(msg);
});

client.on('guildMemberAdd', async (member) => {
    try {
        guildMemberAddEvent(member);
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
        await FriendCodeService.createTableIfNotExists();
        await RecruitService.createTableIfNotExists();
        await MembersService.createTableIfNotExists();
        await TeamDividerService.createTableIfNotExists();
        const guild = client.user.client.guilds.cache.get(process.env.SERVER_ID);
        client.user.setActivity(`${guild.memberCount}人`, { type: ActivityType.Playing });
        updateSchedule();
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
        await emojiCountUp(reaction);
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
            ButtonHandler.call(interaction);
        }

        if (interaction.isModalSubmit()) {
            ModalHandler.call(interaction);
        }

        if (interaction.isMessageContextMenuCommand()) {
            ContextMenuHandler.call(interaction);
        }

        if (interaction.isCommand()) {
            CommandHandler.call(interaction);
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

client.on('threadCreate', async (thread) => {
    if (isNotEmpty(thread.parentId) && thread.parentId == process.env.CHANNEL_ID_SUPPORT_CENTER) {
        editThreadTag(thread);
        sendCloseButton(thread);
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    VCStateUpdateHander.call(oldState, newState);
});
