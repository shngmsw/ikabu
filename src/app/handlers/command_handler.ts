import { handleBan } from '../feat-admin/ban/ban';
import { handleBuki } from '../feat-utils/splat3/buki';
import { handleHelp } from '../feat-utils/other/help.js';
import { handleKansen } from '../feat-utils/other/kansen.js';
import { handlePick } from '../feat-utils/other/pick.js';
import { handleShow } from '../feat-utils/splat3/show';
import { handleTimer } from '../feat-utils/other/timer.js';
import { handleVoicePick } from '../feat-utils/voice/vpick.js';
import { handleWiki } from '../feat-utils/other/wiki.js';
import { handleCreateRole, handleDeleteRole, handleAssignRole, handleUnassignRole } from '../feat-admin/channel_manager/manageRole.js';
import { handleDeleteCategory } from '../feat-admin/channel_manager/deleteCategory.js';
import { handleDeleteChannel } from '../feat-admin/channel_manager/deleteChannel.js';
import { handleCreateRoom } from '../feat-admin/channel_manager/createRoom.js';
import { getCloseEmbed, getCommandHelpEmbed } from '../common/others';
import { otherGameRecruit } from '../feat-recruit/interactions/commands/other_game_recruit';
import { regularRecruit } from '../feat-recruit/interactions/commands/regular_recruit';
import { fesRecruit } from '../feat-recruit/interactions/commands/fes_recruit';
import { anarchyRecruit } from '../feat-recruit/interactions/commands/anarchy_recruit';
import { salmonRecruit } from '../feat-recruit/interactions/commands/salmon_recruit';
import { privateRecruit } from '../feat-recruit/interactions/commands/private_recruit';
import { voiceMention } from '../feat-utils/voice/voice_mention.js';
import { dividerInitialMessage } from '../feat-utils/team_divider/divider';
import { handleIkabuExperience } from '../feat-utils/other/experience.js';
import { voiceLocker } from '../feat-utils/voice/voice_locker';
import { handleFriendCode } from '../feat-utils/other/friendcode';
import { sendCommandLog } from '../logs/commands/command_log';
import { variablesHandler } from '../feat-admin/environment_variables/variables_handler';
import { createNewRecruitButton } from '../feat-recruit/buttons/create_recruit_buttons';
import { commandNames } from '../../constant.js';
import { setting } from '../feat-utils/voice/tts/voice_bot_node';
import { handleVoiceCommand } from '../feat-utils/voice/tts/discordjs_voice';

export async function call(interaction: $TSFixMe) {
    const { commandName } = interaction;
    const { options } = interaction;

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
        await dividerInitialMessage(interaction);
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
        await handleIkabuExperience(interaction);
    } else if (commandName === commandNames.voiceChannelMention) {
        await voiceMention(interaction);
    } else if (commandName === commandNames.variablesSettings) {
        await variablesHandler(interaction);
    } else if (commandName == commandNames.wiki) {
        await handleWiki(interaction);
    } else if (commandName == commandNames.kansen) {
        await handleKansen(interaction);
    } else if (commandName == commandNames.timer) {
        await handleTimer(interaction);
    } else if (commandName == commandNames.pick) {
        await handlePick(interaction);
    } else if (commandName == commandNames.voice_pick) {
        await handleVoicePick(interaction);
    } else if (commandName == commandNames.buki) {
        await handleBuki(interaction);
    } else if (commandName == commandNames.show) {
        await handleShow(interaction);
    } else if (commandName == commandNames.help) {
        await handleHelp(interaction);
    } else if (commandName == commandNames.ban) {
        await handleBan(interaction);
    } else if (commandName === commandNames.voice) {
        // 'インタラクションに失敗'が出ないようにするため
        await interaction.deferReply();
        await handleVoiceCommand(interaction);
        await setting(interaction);
    } else if (commandName == commandNames.ch_manager) {
        const subCommand = options.getSubcommand();
        switch (subCommand) {
            case 'チャンネル作成':
                await handleCreateRoom(interaction);
                break;
            case 'ロール作成':
                await handleCreateRole(interaction);
                break;
            case 'ロール割当':
                await handleAssignRole(interaction);
                break;
            case 'ロール解除':
                await handleUnassignRole(interaction);
                break;
            case 'カテゴリー削除':
                await handleDeleteCategory(interaction);
                break;
            case 'チャンネル削除':
                await handleDeleteChannel(interaction);
                break;
            case 'ロール削除':
                await handleDeleteRole(interaction);
                break;
        }
    }
    await sendCommandLog(interaction); // DB使うものはawait付けないとcloseエラー出る
    return;
}
