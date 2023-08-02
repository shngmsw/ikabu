import { CacheType, ChatInputCommandInteraction } from 'discord.js';

import { commandNames } from '../../constant.js';
import { assertExistCheck, getCloseEmbed, getCommandHelpEmbed } from '../common/others';
import { handleBan } from '../feat-admin/ban/ban';
import { handleCreateRoom } from '../feat-admin/channel_manager/createRoom.js';
import { handleDeleteCategory } from '../feat-admin/channel_manager/deleteCategory.js';
import { handleDeleteChannel } from '../feat-admin/channel_manager/deleteChannel.js';
import { handleCreateRole, handleDeleteRole, handleAssignRole, handleUnassignRole } from '../feat-admin/channel_manager/manageRole.js';
import { variablesHandler } from '../feat-admin/environment_variables/variables_handler';
import { festSettingHandler } from '../feat-admin/fest_setting/fest_settins.js';
import { joinedAtFixer } from '../feat-admin/joined_date_fixer/fix_joined_date.js';
import { createNewRecruitButton } from '../feat-recruit/buttons/create_recruit_buttons';
import { anarchyRecruit } from '../feat-recruit/interactions/commands/anarchy_recruit';
import { buttonRecruit } from '../feat-recruit/interactions/commands/button_recruit.js';
import { eventRecruit } from '../feat-recruit/interactions/commands/event_recruit';
import { fesRecruit } from '../feat-recruit/interactions/commands/fes_recruit';
import { otherGameRecruit } from '../feat-recruit/interactions/commands/other_game_recruit';
import { privateRecruit } from '../feat-recruit/interactions/commands/private_recruit';
import { regularRecruit } from '../feat-recruit/interactions/commands/regular_recruit';
import { salmonRecruit } from '../feat-recruit/interactions/commands/salmon_recruit';
import { handleIkabuExperience } from '../feat-utils/other/experience.js';
import { handleFriendCode } from '../feat-utils/other/friendcode';
import { handleHelp } from '../feat-utils/other/help.js';
import { handleKansen } from '../feat-utils/other/kansen.js';
import { handlePick } from '../feat-utils/other/pick.js';
import { handleTimer } from '../feat-utils/other/timer.js';
import { handleWiki } from '../feat-utils/other/wiki.js';
import { handleBuki } from '../feat-utils/splat3/buki';
import { handleShow } from '../feat-utils/splat3/show';
import { dividerInitialMessage } from '../feat-utils/team_divider/divider';
import { handleVoiceCommand } from '../feat-utils/voice/tts/discordjs_voice';
import { setting } from '../feat-utils/voice/tts/voice_bot_node';
import { voiceLocker } from '../feat-utils/voice/voice_locker';
import { voiceMention } from '../feat-utils/voice/voice_mention.js';
import { handleVoicePick } from '../feat-utils/voice/vpick.js';
import { sendCommandLog } from '../logs/commands/command_log';

export async function call(interaction: ChatInputCommandInteraction<CacheType>) {
    await sendCommandLog(interaction);

    await CommandsHandler(interaction); // DMとGuild両方で動くコマンド

    if (interaction.inGuild()) {
        // Guildのみで動くコマンド
        await guildOnlyCommandsHandler(interaction);
    } else {
        // DMのみで動くコマンド
    }

    return;
}

async function guildOnlyCommandsHandler(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
    const { commandName } = interaction;
    const { options } = interaction;

    if (commandName === commandNames.vclock && !(interaction.replied || interaction.deferred)) {
        await voiceLocker(interaction);
    } else if (commandName === commandNames.close) {
        if (!interaction.inGuild()) {
            return;
        }
        assertExistCheck(interaction.channel, 'channel');
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
    } else if (commandName === commandNames.buttonRecruit) {
        await buttonRecruit(interaction);
    } else if (commandName === commandNames.anarchy) {
        await anarchyRecruit(interaction);
    } else if (commandName === commandNames.private) {
        await privateRecruit(interaction);
    } else if (commandName === commandNames.event) {
        await eventRecruit(interaction);
    } else if (commandName === commandNames.fesA) {
        await fesRecruit(interaction);
    } else if (commandName === commandNames.fesB) {
        await fesRecruit(interaction);
    } else if (commandName === commandNames.fesC) {
        await fesRecruit(interaction);
    } else if (commandName === commandNames.salmon) {
        await salmonRecruit(interaction);
    } else if (commandName === commandNames.experience) {
        await handleIkabuExperience(interaction);
    } else if (commandName === commandNames.voiceChannelMention) {
        await voiceMention(interaction);
    } else if (commandName === commandNames.variablesSettings) {
        await variablesHandler(interaction);
    } else if (commandName == commandNames.voice_pick) {
        await handleVoicePick(interaction);
    } else if (commandName == commandNames.ban) {
        await handleBan(interaction);
    } else if (commandName == commandNames.joinedDateFixer) {
        await joinedAtFixer(interaction);
    } else if (commandName == commandNames.festivalSettings) {
        await festSettingHandler(interaction);
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
}

async function CommandsHandler(interaction: ChatInputCommandInteraction<CacheType>) {
    const { commandName } = interaction;

    if (commandName === commandNames.friend_code) {
        await handleFriendCode(interaction);
    } else if (commandName == commandNames.wiki) {
        await handleWiki(interaction);
    } else if (commandName == commandNames.kansen) {
        await handleKansen(interaction);
    } else if (commandName == commandNames.timer) {
        await handleTimer(interaction);
    } else if (commandName == commandNames.pick) {
        await handlePick(interaction);
    } else if (commandName == commandNames.buki) {
        await handleBuki(interaction);
    } else if (commandName == commandNames.show) {
        await handleShow(interaction);
    } else if (commandName == commandNames.help) {
        await handleHelp(interaction);
    }
}
