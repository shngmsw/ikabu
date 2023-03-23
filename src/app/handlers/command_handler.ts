// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleBan = require("../feat-admin/ban/ban");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleBuki = require("../feat-utils/splat3/buki");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleHelp = require("../feat-utils/other/help.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleKansen = require("../feat-utils/other/kansen.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handlePick = require("../feat-utils/other/pick.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleShow = require("../feat-utils/splat3/show");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleTimer = require("../feat-utils/other/timer.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleVoicePick = require("../feat-utils/voice/vpick.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleWiki = require("../feat-utils/other/wiki.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleCrea... Remove this comment to see the full error message
const {
  handleCreateRole,
  handleDeleteRole,
  handleAssignRole,
  handleUnassignRole,
} = require("../feat-admin/channel_manager/manageRole.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleDeleteCategory = require("../feat-admin/channel_manager/deleteCategory.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleDeleteChannel = require("../feat-admin/channel_manager/deleteChannel.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleCreateRoom = require("../feat-admin/channel_manager/createRoom.js");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const VOICE_API = require("../feat-utils/voice/tts/voice_bot_node");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DISCORD_VO... Remove this comment to see the full error message
const DISCORD_VOICE = require("../feat-utils/voice/tts/discordjs_voice");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getCloseEm... Remove this comment to see the full error message
const { getCloseEmbed, getCommandHelpEmbed } = require("../common/others");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'otherGameR... Remove this comment to see the full error message
const {
  otherGameRecruit,
} = require("../feat-recruit/interactions/commands/other_game_recruit");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'regularRec... Remove this comment to see the full error message
const {
  regularRecruit,
} = require("../feat-recruit/interactions/commands/regular_recruit");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fesRecruit... Remove this comment to see the full error message
const {
  fesRecruit,
} = require("../feat-recruit/interactions/commands/fes_recruit");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'anarchyRec... Remove this comment to see the full error message
const {
  anarchyRecruit,
} = require("../feat-recruit/interactions/commands/anarchy_recruit");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'salmonRecr... Remove this comment to see the full error message
const {
  salmonRecruit,
} = require("../feat-recruit/interactions/commands/salmon_recruit");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'privateRec... Remove this comment to see the full error message
const {
  privateRecruit,
} = require("../feat-recruit/interactions/commands/private_recruit");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'voiceMenti... Remove this comment to see the full error message
const { voiceMention } = require("../feat-utils/voice/voice_mention.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'divider'.
const divider = require("../feat-utils/team_divider/divider");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const handleIkabuExperience = require("../feat-utils/other/experience.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'voiceLocke... Remove this comment to see the full error message
const { voiceLocker } = require("../feat-utils/voice/voice_locker");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { handleFriendCode } = require("../feat-utils/other/friendcode");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendComman... Remove this comment to see the full error message
const { sendCommandLog } = require("../logs/commands/command_log.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'variablesH... Remove this comment to see the full error message
const {
  variablesHandler,
} = require("../feat-admin/environment_variables/variables_handler");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createNewR... Remove this comment to see the full error message
const {
  createNewRecruitButton,
} = require("../feat-recruit/buttons/create_recruit_buttons");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'commandNam... Remove this comment to see the full error message
const { commandNames } = require("../../constant.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  call: call,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction: $TSFixMe) {
  const { commandName } = interaction;
  const { options } = interaction;

  sendCommandLog(interaction); // ログ処理待たせたくないのでawaitなし

  if (
    commandName === commandNames.vclock &&
    !(interaction.replied || interaction.deferred)
  ) {
    await voiceLocker(interaction);
  } else if (commandName === commandNames.close) {
    //serverコマンド
    const embed = getCloseEmbed();
    if (!interaction.replied) {
      await interaction.reply({
        embeds: [embed, getCommandHelpEmbed(interaction.channel.name)],
        components: [createNewRecruitButton(interaction.channel.name)],
      });
    }
  } else if (commandName === commandNames.team_divider) {
    await divider.dividerInitialMessage(interaction);
  } else if (commandName === commandNames.regular) {
    await regularRecruit(interaction);
  } else if (commandName === commandNames.other_game) {
    await otherGameRecruit(interaction);
  } else if (commandName === commandNames.anarchy) {
    await anarchyRecruit(interaction);
  } else if (commandName === commandNames.private) {
    await privateRecruit(interaction);
  } else if (commandName === commandNames.league) {
    // await leagueRecruit(interaction);
  } else if (commandName === commandNames.fesA) {
    await fesRecruit(interaction);
  } else if (commandName === commandNames.fesB) {
    await fesRecruit(interaction);
  } else if (commandName === commandNames.fesC) {
    await fesRecruit(interaction);
  } else if (commandName === commandNames.salmon) {
    await salmonRecruit(interaction);
  } else if (commandName === commandNames.friend_code) {
    await handleFriendCode(interaction);
  } else if (commandName === commandNames.experience) {
    handleIkabuExperience(interaction);
  } else if (commandName === commandNames.voiceChannelMention) {
    voiceMention(interaction);
  } else if (commandName === commandNames.variablesSettings) {
    variablesHandler(interaction);
  } else if (commandName == commandNames.wiki) {
    handleWiki(interaction);
  } else if (commandName == commandNames.kansen) {
    handleKansen(interaction);
  } else if (commandName == commandNames.timer) {
    handleTimer(interaction);
  } else if (commandName == commandNames.pick) {
    handlePick(interaction);
  } else if (commandName == commandNames.voice_pick) {
    handleVoicePick(interaction);
  } else if (commandName == commandNames.buki) {
    handleBuki(interaction);
  } else if (commandName == commandNames.show) {
    handleShow(interaction);
  } else if (commandName == commandNames.help) {
    handleHelp(interaction);
  } else if (commandName == commandNames.ban) {
    handleBan(interaction);
  } else if (commandName === commandNames.voice) {
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply();
    DISCORD_VOICE.handleVoiceCommand(interaction);
    VOICE_API.setting(interaction);
  } else if (commandName == commandNames.ch_manager) {
    const subCommand = options.getSubcommand();
    switch (subCommand) {
      case "チャンネル作成":
        handleCreateRoom(interaction);
        break;
      case "ロール作成":
        handleCreateRole(interaction);
        break;
      case "ロール割当":
        handleAssignRole(interaction);
        break;
      case "ロール解除":
        handleUnassignRole(interaction);
        break;
      case "カテゴリー削除":
        handleDeleteCategory(interaction);
        break;
      case "チャンネル削除":
        handleDeleteChannel(interaction);
        break;
      case "ロール削除":
        handleDeleteRole(interaction);
        break;
    }
  }
  return;
}
