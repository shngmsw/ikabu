// Discord bot implements
import { ActivityType, Client, GatewayIntentBits, Partials } from 'discord.js'
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.User, Partials.GuildMember, Partials.Message, Partials.Reaction],
})

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import MessageHandler from './handlers/message_handler'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import CommandHandler from './handlers/command_handler'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import ModalHandler from './handlers/modal_handler'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import ButtonHandler from './handlers/button_handler'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import ContextMenuHandler from './handlers/context_handler'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import VCStateUpdateHandler from './handlers/vcState_update_handler'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
import { isNotEmpty } from './common/others'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import emojiCountUp from './event/reaction_count/reactions.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'guildMembe... Remove this comment to see the full error message
import { guildMemberAddEvent } from './event/rookie/set_rookie.js'
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import registerSlashCommands from '../register.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DBCommon'.
import DBCommon from '../../db/db.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'RecruitSer... Remove this comment to see the full error message
import RecruitService from '../../db/recruit_service.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'TeamDivide... Remove this comment to see the full error message
import TeamDividerService from '../../db/team_divider_service.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from 'log4js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FriendCode... Remove this comment to see the full error message
import FriendCodeService from '../../db/friend_code_service.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MembersSer... Remove this comment to see the full error message
import MembersService from '../../db/members_service.js'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'editThread... Remove this comment to see the full error message
import { editThreadTag } from './event/support_auto_tag/edit_tag'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendCloseB... Remove this comment to see the full error message
import { sendCloseButton } from './event/support_auto_tag/send_support_close_button'
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'updateSche... Remove this comment to see the full error message
import { updateSchedule } from './common/apis/splatoon3_ink.js'

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
client.login(process.env.DISCORD_BOT_TOKEN)

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH)
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger()

client.on('messageCreate', async (msg: $TSFixMe) => {
  MessageHandler.call(msg)
})

client.on('guildMemberAdd', async (member: $TSFixMe) => {
  try {
    guildMemberAddEvent(member)
    const guild = await member.guild.fetch()
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    if (guild.id === process.env.SERVER_ID) {
      client.user.setActivity(`${guild.memberCount}人`, {
        type: ActivityType.Playing
      })
    }
  } catch (error) {
    const loggerMA = log4js.getLogger('guildMemberAdd')
    loggerMA.error(error)
  }
})

client.on('guildMemberRemove', async (member: $TSFixMe) => {
  try {
    const tag = member.user.tag
    const period = Math.round((Date.now() - member.joinedAt) / 86400000) // サーバーに居た期間を日数にして計算
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const retireLog = member.guild.channels.cache.get(process.env.CHANNEL_ID_RETIRE_LOG)
    if (retireLog != null) {
      retireLog.send(`${tag} さんが退部しました。入部日: ${member.joinedAt} 入部期間：${period}日間`)
    }
    const guild = await member.guild.fetch()
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    if (guild.id === process.env.SERVER_ID) {
      client.user.setActivity(`${guild.memberCount}人`, {
        type: ActivityType.Playing
      })
    }
  } catch (err) {
    const loggerMR = log4js.getLogger('guildMemberRemove')
    loggerMR.error({ err })
  }
})

client.on('ready', async () => {
  try {
    logger.info(`Logged in as ${client.user.tag}!`)
    // ready後にready以前に実行されたinteractionのinteractionCreateがemitされるが、
    // そのときにはinteractionがtimeoutしておりfollowupで失敗することがよくある。
    // そのようなことを避けるためready内でハンドラを登録する。
    // client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => logger.error(err)));
    await registerSlashCommands()
    DBCommon.init()
    await FriendCodeService.createTableIfNotExists()
    await RecruitService.createTableIfNotExists()
    await MembersService.createTableIfNotExists()
    await TeamDividerService.createTableIfNotExists()
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const guild = client.user.client.guilds.cache.get(process.env.SERVER_ID)
    client.user.setActivity(`${guild.memberCount}人`, { type: ActivityType.Playing })
    updateSchedule()
  } catch (error) {
    logger.error(error)
  }
})

client.on('messageReactionAdd', async (reaction: $TSFixMe, user: $TSFixMe) => {
  const loggerMRA = log4js.getLogger('messageReactionAdd')
  try {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch()
      } catch (error) {
        loggerMRA.error('Something went wrong when fetching the message:', error)
        return
      }
    }
    await emojiCountUp(reaction)
  } catch (error) {
    loggerMRA.error(error)
  }
})

client.on('messageReactionRemove', async (reaction: $TSFixMe, user: $TSFixMe) => {
  try {
    if (!user.bot) { /* empty */ }
  } catch (error) {
    const loggerMRR = log4js.getLogger('messageReactionRemove')
    loggerMRR.error(error)
  }
})

/**
 *
 * @param {Discord.Interaction} interaction
 */
async function onInteraction (interaction: $TSFixMe) {
  try {
    if (interaction.isButton()) {
      ButtonHandler.call(interaction)
    }

    if (interaction.isModalSubmit()) {
      ModalHandler.call(interaction)
    }

    if (interaction.isMessageContextMenuCommand()) {
      ContextMenuHandler.call(interaction)
    }

    if (interaction.isCommand()) {
      CommandHandler.call(interaction)
    }
  } catch (error) {
    const interactionLogger = log4js.getLogger('interaction')
    const errorDetail = {
      content: `Command failed: ${error}`,
      interaction_replied: interaction.replied,
      interaction_deferred: interaction.deferred
    }
    interactionLogger.error(errorDetail)
  }
}

client.on('interactionCreate', (interaction: $TSFixMe) => onInteraction(interaction))

client.on('threadCreate', async (thread: $TSFixMe) => {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (isNotEmpty(thread.parentId) && thread.parentId === process.env.CHANNEL_ID_SUPPORT_CENTER) {
    editThreadTag(thread)
    sendCloseButton(thread)
  }
})

client.on('voiceStateUpdate', (oldState: $TSFixMe, newState: $TSFixMe) => {
  VCStateUpdateHandler.call(oldState, newState)
})
