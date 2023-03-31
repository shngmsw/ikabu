// Discord bot implements
import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { DBCommon } from "../db/db";
import { FriendCodeService } from "../db/friend_code_service";
import { MembersService } from "../db/members_service";
import { RecruitService } from "../db/recruit_service";
import { TeamDividerService } from "../db/team_divider_service";
import { log4js_obj } from "../log4js_settings";
import { updateSchedule } from "./common/apis/splatoon3_ink";
import { emojiCountUp } from "./event/reaction_count/reactions";
import { guildMemberAddEvent } from "./event/rookie/set_rookie";
import * as message_handler from "./handlers/message_handler";
import * as button_handler from "./handlers/button_handler";
import * as modal_handler from "./handlers/modal_handler";
import * as context_handler from "./handlers/context_handler";
import * as command_handler from "./handlers/command_handler";
import * as vcState_update_handler from "./handlers/vcState_update_handler";
import { isNotEmpty } from "./common/others";
import { editThreadTag } from "./event/support_auto_tag/edit_tag";
import { sendCloseButton } from "./event/support_auto_tag/send_support_close_button";
import { registerSlashCommands } from "../register";
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

client.login(process.env.DISCORD_BOT_TOKEN);

const logger = log4js_obj.getLogger();

client.on("messageCreate", async (msg: $TSFixMe) => {
  message_handler.call(msg);
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
    const loggerMA = log4js_obj.getLogger("guildMemberAdd");
    loggerMA.error(error);
  }
});

client.on("guildMemberRemove", async (member: $TSFixMe) => {
  try {
    const tag = member.user.tag;
    const period = Math.round((Date.now() - member.joinedAt) / 86400000); // サーバーに居た期間を日数にして計算
    const retireLog = member.guild.channels.cache.get(
      process.env.CHANNEL_ID_RETIRE_LOG
    );
    if (retireLog != null) {
      retireLog.send(
        `${tag} さんが退部しました。入部日: ${member.joinedAt} 入部期間：${period}日間`
      );
    }
    const guild = await member.guild.fetch();
    if (guild.id === process.env.SERVER_ID) {
      if (client.user == null) {
        throw new Error("client.user is null");
      }
      client.user.setActivity(`${guild.memberCount}人`, {
        type: ActivityType.Playing,
      });
    }
  } catch (err) {
    const loggerMR = log4js_obj.getLogger("guildMemberRemove");
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
    const guild = client.user.client.guilds.cache.get(process.env.SERVER_ID || "");
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
  const loggerMRA = log4js_obj.getLogger("messageReactionAdd");
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
      const loggerMRR = log4js_obj.getLogger("messageReactionRemove");
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
      button_handler.call(interaction);
    }

    if (interaction.isModalSubmit()) {
      modal_handler.call(interaction);
    }

    if (interaction.isMessageContextMenuCommand()) {
      context_handler.call(interaction);
    }

    if (interaction.isCommand()) {
      command_handler.call(interaction);
    }
  } catch (error) {
    const interactionLogger = log4js_obj.getLogger("interaction");
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
  if (
    isNotEmpty(thread.parentId) &&
    thread.parentId === process.env.CHANNEL_ID_SUPPORT_CENTER
  ) {
    editThreadTag(thread);
    sendCloseButton(thread);
  }
});

client.on("voiceStateUpdate", (oldState: $TSFixMe, newState: $TSFixMe) => {
  vcState_update_handler.call(oldState, newState);
});