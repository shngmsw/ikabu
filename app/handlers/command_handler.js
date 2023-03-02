const handleBan = require('../feat-admin/ban/ban');
const handleBuki = require('../feat-utils/splat3/buki');
const handleHelp = require('../feat-utils/other/help.js');
const handleKansen = require('../feat-utils/other/kansen.js');
const handlePick = require('../feat-utils/other/pick.js');
const handleShow = require('../feat-utils/splat3/show');
const handleTimer = require('../feat-utils/other/timer.js');
const handleVoicePick = require('../feat-utils/voice/vpick.js');
const handleWiki = require('../feat-utils/other/wiki.js');
const { handleCreateRole, handleDeleteRole, handleAssignRole, handleUnassignRole } = require('../feat-admin/channel_manager/manageRole.js');
const handleDeleteCategory = require('../feat-admin/channel_manager/deleteCategory.js');
const handleDeleteChannel = require('../feat-admin/channel_manager/deleteChannel.js');
const handleCreateRoom = require('../feat-admin/channel_manager/createRoom.js');
const VOICE_API = require('../feat-utils/voice/tts/voice_bot_node');
const DISCORD_VOICE = require('../feat-utils/voice/tts/discordjs_voice');
const { getCloseEmbed, getCommandHelpEmbed } = require('../common/others');
const { otherGameRecruit } = require('../feat-recruit/interactions/commands/other_game_recruit');
const { regularRecruit } = require('../feat-recruit/interactions/commands/regular_recruit');
const { fesRecruit } = require('../feat-recruit/interactions/commands/fes_recruit');
const { anarchyRecruit } = require('../feat-recruit/interactions/commands/anarchy_recruit');
const { salmonRecruit } = require('../feat-recruit/interactions/commands/salmon_recruit');
const { privateRecruit } = require('../feat-recruit/interactions/commands/private_recruit');
const { voiceMention } = require('../feat-utils/voice/voice_mention.js');
const divider = require('../feat-utils/team_divider/divider');
const handleIkabuExperience = require('../feat-utils/other/experience.js');
const { voiceLocker } = require('../feat-utils/voice/voice_locker');
const { handleFriendCode } = require('../feat-utils/other/friendcode');
const { sendCommandLog } = require('../event/command_log.js');
const { variablesHandler } = require('../feat-admin/environment_variables/variables_handler');
const { createNewRecruitButton } = require('../feat-recruit/buttons/create_recruit_buttons');
const { commandNames } = require('../../constant.js');
const log4js = require('log4js');

module.exports = {
    call: call,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction) {
    const { commandName } = interaction;
    const { options } = interaction;

    sendCommandLog(interaction); // ログ処理待たせたくないのでawaitなし

    if (commandName === commandNames.vclock && !(interaction.replied || interaction.deferred)) {
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
            case 'チャンネル作成':
                handleCreateRoom(interaction);
                break;
            case 'ロール作成':
                handleCreateRole(interaction);
                break;
            case 'ロール割当':
                handleAssignRole(interaction);
                break;
            case 'ロール解除':
                handleUnassignRole(interaction);
                break;
            case 'カテゴリー削除':
                handleDeleteCategory(interaction);
                break;
            case 'チャンネル削除':
                handleDeleteChannel(interaction);
                break;
            case 'ロール削除':
                handleDeleteRole(interaction);
                break;
        }
    }
    return;
}
