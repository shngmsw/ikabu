// Discord bot implements
import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.User,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
});

import DBCommon from "../../db/db";
import FriendCodeService from "../../db/friend_code_service";
import MembersService from "../../db/members_service";
import RecruitService from "../../db/recruit_service";
import TeamDividerService from "../../db/team_divider_service";
import { log4js_obj } from "../log4js_settings";
import registerSlashCommands from "../register";
import { updateSchedule } from "./common/apis/splatoon3_ink";
import { isNotEmpty } from "./common/others";
import emojiCountUp from "./event/reaction_count/reactions";
import { guildMemberAddEvent } from "./event/rookie/set_rookie";
import { editThreadTag } from "./event/support_auto_tag/edit_tag";
import { sendCloseButton } from "./event/support_auto_tag/send_support_close_button";
import ButtonHandler from "./handlers/button_handler";
import CommandHandler from "./handlers/command_handler";
import ContextMenuHandler from "./handlers/context_handler";
import MessageHandler from "./handlers/message_handler";
import ModalHandler from "./handlers/modal_handler";
import VCStateUpdateHandler from "./handlers/vcState_update_handler";

client.login(process.env.DISCORD_BOT_TOKEN);

const logger = log4js_obj.getLogger();

client.on("messageCreate", async (msg: $TSFixMe) => {
  MessageHandler.call(msg);
});

client.on("guildMemberAdd", async (member: $TSFixMe) => {
  try {
    guildMemberAddEvent(member);
    const guild = await member.guild.fetch();
    if (client.user == null) {
      throw new Error("client.user is null");
    }
    if (guild.id === process.env.SERVER_ID) {
      client.user.setActivity(`${guild.memberCount}人`, {
        type: ActivityType.Playing,
      });
    }
  } catch (error) {
    const loggerMA = log4js.getLogger("guildMemberAdd");
    loggerMA.error(error);
  }
});

client.on("guildMemberRemove", async (member: $TSFixMe) => {
  try {
    const tag = member.user.tag;
    const period = Math.round((Date.now() - member.joinedAt) / 86400000); // サーバーに居た期間を日数にして計算
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const retireLog = member.guild.channels.cache.get(
      process.env.CHANNEL_ID_RETIRE_LOG
    );
    if (retireLog != null) {
      retireLog.send(
        `${tag} さんが退部しました。入部日: ${member.joinedAt} 入部期間：${period}日間`
      );
    }
    const guild = await member.guild.fetch();
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    if (guild.id === process.env.SERVER_ID) {
      if (client.user == null) {
        throw new Error("client.user is null");
      }
      client.user.setActivity(`${guild.memberCount}人`, {
        type: ActivityType.Playing,
      });
    }
  } catch (err) {
    const loggerMR = log4js.getLogger("guildMemberRemove");
    loggerMR.error({ err });
  }
});

client.on("ready", async () => {
  try {
    if (client.user == null) {
      throw new Error("client.user is null");
    }
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
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const guild = client.user.client.guilds.cache.get(process.env.SERVER_ID);
    if (guild == null) {
      throw new Error("guild is null");
    }
    client.user.setActivity(`${guild.memberCount}人`, {
      type: ActivityType.Playing,
    });
    updateSchedule();
  } catch (error) {
    logger.error(error);
  }
});

client.on("messageReactionAdd", async (reaction: $TSFixMe, user: $TSFixMe) => {
  const loggerMRA = log4js.getLogger("messageReactionAdd");
  try {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        loggerMRA.error(
          "Something went wrong when fetching the message:",
          error
        );
        return;
      }
    }
    await emojiCountUp(reaction);
  } catch (error) {
    loggerMRA.error(error);
  }
});

client.on(
  "messageReactionRemove",
  async (reaction: $TSFixMe, user: $TSFixMe) => {
    try {
      if (!user.bot) {
        /* empty */
      }
    } catch (error) {
      const loggerMRR = log4js.getLogger("messageReactionRemove");
      loggerMRR.error(error);
    }
  }
);

/**
 *
 * @param {Discord.Interaction} interaction
 */
async function onInteraction(interaction: $TSFixMe) {
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
    const interactionLogger = log4js.getLogger("interaction");
    const errorDetail = {
      content: `Command failed: ${error}`,
      interaction_replied: interaction.replied,
      interaction_deferred: interaction.deferred,
    };
    interactionLogger.error(errorDetail);
  }
}

client.on("interactionCreate", (interaction: $TSFixMe) =>
  onInteraction(interaction)
);

client.on("threadCreate", async (thread: $TSFixMe) => {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (
    isNotEmpty(thread.parentId) &&
    thread.parentId === process.env.CHANNEL_ID_SUPPORT_CENTER
  ) {
    editThreadTag(thread);
    sendCloseButton(thread);
  }
});

client.on("voiceStateUpdate", (oldState: $TSFixMe, newState: $TSFixMe) => {
  VCStateUpdateHandler.call(oldState, newState);
});
