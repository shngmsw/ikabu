import { URLSearchParams } from 'url';

import { ButtonInteraction, CacheType } from 'discord.js';

import { exists } from '../common/others';
import {
    sendQuestionnaireFollowUp,
    disableQuestionnaireButtons,
} from '../event/rookie/send_questionnaire';
import { setResolvedTag } from '../event/support_auto_tag/resolved_support';
import { showLockPanelFromVCTools } from '../event/vctools_sticky/linkage_voice_lock';
import { sendRadioRequest } from '../event/vctools_sticky/radio_request';
import { cancel } from '../feat-recruit/interactions/buttons/cancel_event';
import { cancelNotify } from '../feat-recruit/interactions/buttons/cancel_notify_event';
import { close } from '../feat-recruit/interactions/buttons/close_event';
import { closeNotify } from '../feat-recruit/interactions/buttons/close_notify_event';
import { del } from '../feat-recruit/interactions/buttons/delete_event';
import { join } from '../feat-recruit/interactions/buttons/join_event';
import { joinNotify } from '../feat-recruit/interactions/buttons/join_notify_event';
import { unlock } from '../feat-recruit/interactions/buttons/other_events.js';
import { handleCreateModal } from '../feat-recruit/modals/create_recruit_modals';
import { deleteFriendCode } from '../feat-utils/other/friendcode';
import {
    alfaButton,
    bravoButton,
    cancelButton,
    correctButton,
    endButton,
    hideButton,
    joinButton,
    registerButton,
    spectateButton,
} from '../feat-utils/team_divider/divider';
import { joinTTS, killTTS } from '../feat-utils/voice/tts/discordjs_voice';
import { voiceLockerUpdate } from '../feat-utils/voice/voice_locker';

export async function call(interaction: ButtonInteraction<CacheType>) {
    // サーバとDM両方で動くボタン

    if (interaction.customId == 'fchide') {
        await deleteFriendCode(interaction);
    }

    if (interaction.inGuild()) {
        // サーバ内のみで動くボタン
        const params = new URLSearchParams(interaction.customId);
        const param_q = params.get('q') || null;
        const param_d = params.get('d') || null;
        const param_t = params.get('t') || null;
        const voiceLockerIds = ['voiceLock_inc', 'voiceLock_dec', 'voiceLockOrUnlock'];
        if (voiceLockerIds.includes(interaction.customId)) {
            await voiceLockerUpdate(interaction);
        } else if (interaction.customId === 'voiceJoin') {
            await interaction.deferReply({ ephemeral: true });
            await joinTTS(interaction);
        } else if (interaction.customId === 'voiceKill') {
            await interaction.deferReply({ ephemeral: true });
            await killTTS(interaction);
        } else if (interaction.customId === 'requestRadio') {
            await sendRadioRequest(interaction);
        } else if (interaction.customId === 'showLockPanel') {
            await showLockPanelFromVCTools(interaction);
        } else if (interaction.customId === 'support_resolved') {
            await setResolvedTag(interaction);
        } else if (exists(param_d) && exists(param_d)) {
            switch (param_d) {
                case 'jr':
                    await join(interaction, params);
                    break;
                case 'cr':
                    await cancel(interaction, params);
                    break;
                case 'del':
                    await del(interaction, params);
                    break;
                case 'close':
                    await close(interaction, params);
                    break;
                case 'unl':
                    await unlock(interaction, params);
                    break;
                case 'njr':
                    await joinNotify(interaction);
                    break;
                case 'ncr':
                    await cancelNotify(interaction);
                    break;
                case 'nclose':
                    await closeNotify(interaction);
                    break;
                case 'newr':
                    await handleCreateModal(interaction, params);
                    break;
                default:
                    break;
            }
        } else if (exists(param_t) && exists(param_t)) {
            switch (param_t) {
                case 'join':
                    await joinButton(interaction, params);
                    break;
                case 'register':
                    await registerButton(interaction, params);
                    break;
                case 'cancel':
                    await cancelButton(interaction, params);
                    break;
                case 'alfa':
                    await alfaButton(interaction, params);
                    break;
                case 'bravo':
                    await bravoButton(interaction, params);
                    break;
                case 'spectate':
                    await spectateButton(interaction, params);
                    break;
                case 'end':
                    await endButton(interaction, params);
                    break;
                case 'correct':
                    await correctButton(interaction, params);
                    break;
                case 'hide':
                    await hideButton(interaction, params);
                    break;
                default:
                    break;
            }
        } else if (exists(param_q) && exists(param_q)) {
            switch (param_q) {
                case 'yes':
                    await sendQuestionnaireFollowUp(interaction, params);
                    break;
                case 'no':
                    await disableQuestionnaireButtons(interaction, params);
                    break;
                default:
                    break;
            }
        }
    } else {
        // DMのみで動くボタン
    }

    return;
}
