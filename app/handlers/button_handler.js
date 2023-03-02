const { URLSearchParams } = require('url');
const { isNotEmpty } = require('../common/others');
const recruitButton = require('../feat-recruit/interactions/buttons/recruit_button_events.js');
const divider = require('../feat-utils/team_divider/divider');
const { sendQuestionnaireFollowUp, disableQuestionnaireButtons } = require('../event/rookie/send_questionnaire');
const { voiceLockerUpdate } = require('../feat-utils/voice/voice_locker');
const { deleteFriendCode } = require('../feat-utils/other/friendcode');
const { handleCreateModal } = require('../feat-recruit/modals/create_recruit_modals');
const { setResolvedTag } = require('../event/support_auto_tag/resolved_support');
const log4js = require('log4js');

module.exports = {
    call: call,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction) {
    const params = new URLSearchParams(interaction.customId);
    const voiceLockerIds = ['voiceLock_inc', 'voiceLock_dec', 'voiceLockOrUnlock'];
    if (voiceLockerIds.includes(interaction.customId)) {
        voiceLockerUpdate(interaction);
    } else if (interaction.customId == 'fchide') {
        deleteFriendCode(interaction);
    } else if (interaction.customId == 'support_resolved') {
        setResolvedTag(interaction);
    } else if (isNotEmpty(params.get('d'))) {
        // buttonごとに呼び出すファンクション
        const recruitButtons = {
            jr: recruitButton.join,
            cr: recruitButton.cancel,
            del: recruitButton.del,
            close: recruitButton.close,
            unl: recruitButton.unlock,
            njr: recruitButton.joinNotify,
            ncr: recruitButton.cancelNotify,
            nclose: recruitButton.closeNotify,
            newr: handleCreateModal,
        };
        await recruitButtons[params.get('d')](interaction, params);
    } else if (isNotEmpty(params.get('t'))) {
        const dividerButtons = {
            join: divider.joinButton,
            register: divider.registerButton,
            cancel: divider.cancelButton,
            alfa: divider.alfaButton,
            bravo: divider.bravoButton,
            spectate: divider.spectateButton,
            end: divider.endButton,
            correct: divider.correctButton,
            hide: divider.hideButton,
        };
        await dividerButtons[params.get('t')](interaction, params);
    } else if (isNotEmpty(params.get('q'))) {
        const questionnaireButtons = {
            yes: sendQuestionnaireFollowUp,
            no: disableQuestionnaireButtons,
        };
        await questionnaireButtons[params.get('q')](interaction, params);
    }
    return;
}
