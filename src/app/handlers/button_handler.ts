import { URLSearchParams } from 'url';
import { isNotEmpty } from '../common/others';
import { join } from '../feat-recruit/interactions/buttons/join_event';
import { cancel } from '../feat-recruit/interactions/buttons/cancel_event';
import { close } from '../feat-recruit/interactions/buttons/close_event';
import { del } from '../feat-recruit/interactions/buttons/delete_event';
import { joinNotify } from '../feat-recruit/interactions/buttons/join_notify_event';
import { cancelNotify } from '../feat-recruit/interactions/buttons/cancel_notify_event';
import { closeNotify } from '../feat-recruit/interactions/buttons/close_notify_event';
import { unlock } from '../feat-recruit/interactions/buttons/other_events.js';
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
import { sendQuestionnaireFollowUp, disableQuestionnaireButtons } from '../event/rookie/send_questionnaire';
import { voiceLockerUpdate } from '../feat-utils/voice/voice_locker';
import { deleteFriendCode } from '../feat-utils/other/friendcode';
import { handleCreateModal } from '../feat-recruit/modals/create_recruit_modals';
import { setResolvedTag } from '../event/support_auto_tag/resolved_support';

interface buttonFunctions {
    [key: string]: (interaction: $TSFixMe, params: $TSFixMe) => Promise<void>;
}

export async function call(interaction: $TSFixMe) {
    const params = new URLSearchParams(interaction.customId);
    const param_d = params.get('d') || null;
    const param_t = params.get('t') || null;
    const param_q = params.get('q') || null;
    const voiceLockerIds = ['voiceLock_inc', 'voiceLock_dec', 'voiceLockOrUnlock'];
    if (voiceLockerIds.includes(interaction.customId)) {
        voiceLockerUpdate(interaction);
    } else if (interaction.customId == 'fchide') {
        deleteFriendCode(interaction);
    } else if (interaction.customId == 'support_resolved') {
        setResolvedTag(interaction);
    } else if (isNotEmpty(param_d) && param_d != null) {
        // buttonごとに呼び出すファンクション
        const recruitButtons: buttonFunctions = {
            jr: join,
            cr: cancel,
            del: del,
            close: close,
            unl: unlock,
            njr: joinNotify,
            ncr: cancelNotify,
            nclose: closeNotify,
            newr: handleCreateModal,
        };
        await recruitButtons[param_d](interaction, params);
    } else if (isNotEmpty(param_t) && param_t != null) {
        const dividerButtons: buttonFunctions = {
            join: joinButton,
            register: registerButton,
            cancel: cancelButton,
            alfa: alfaButton,
            bravo: bravoButton,
            spectate: spectateButton,
            end: endButton,
            correct: correctButton,
            hide: hideButton,
        };
        await dividerButtons[param_t](interaction, params);
    } else if (isNotEmpty(param_q) && param_q != null) {
        const questionnaireButtons: buttonFunctions = {
            yes: sendQuestionnaireFollowUp,
            no: disableQuestionnaireButtons,
        };
        await questionnaireButtons[param_q](interaction, params);
    }
    return;
}
