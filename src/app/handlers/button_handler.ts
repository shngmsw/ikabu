// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'URLSearchP... Remove this comment to see the full error message
const { URLSearchParams } = require("url");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty } = require("../common/others");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const recruitButton = require("../feat-recruit/interactions/buttons/recruit_button_events.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'divider'.
const divider = require("../feat-utils/team_divider/divider");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendQuesti... Remove this comment to see the full error message
const {
  sendQuestionnaireFollowUp,
  disableQuestionnaireButtons,
} = require("../event/rookie/send_questionnaire");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'voiceLocke... Remove this comment to see the full error message
const { voiceLockerUpdate } = require("../feat-utils/voice/voice_locker");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { deleteFriendCode } = require("../feat-utils/other/friendcode");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleCrea... Remove this comment to see the full error message
const {
  handleCreateModal,
} = require("../feat-recruit/modals/create_recruit_modals");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setResolve... Remove this comment to see the full error message
const {
  setResolvedTag,
} = require("../event/support_auto_tag/resolved_support");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
import log4js from "log4js";

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  call: call,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);

// @ts-expect-error TS(2393): Duplicate function implementation.
async function call(interaction: $TSFixMe) {
  const params = new URLSearchParams(interaction.customId);
  const voiceLockerIds = [
    "voiceLock_inc",
    "voiceLock_dec",
    "voiceLockOrUnlock",
  ];
  if (voiceLockerIds.includes(interaction.customId)) {
    voiceLockerUpdate(interaction);
  } else if (interaction.customId == "fchide") {
    deleteFriendCode(interaction);
  } else if (interaction.customId == "support_resolved") {
    setResolvedTag(interaction);
  } else if (isNotEmpty(params.get("d"))) {
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
    // @ts-expect-error TS(2538): Type 'null' cannot be used as an index type.
    await recruitButtons[params.get("d")](interaction, params);
  } else if (isNotEmpty(params.get("t"))) {
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
    // @ts-expect-error TS(2538): Type 'null' cannot be used as an index type.
    await dividerButtons[params.get("t")](interaction, params);
  } else if (isNotEmpty(params.get("q"))) {
    const questionnaireButtons = {
      yes: sendQuestionnaireFollowUp,
      no: disableQuestionnaireButtons,
    };
    // @ts-expect-error TS(2538): Type 'null' cannot be used as an index type.
    await questionnaireButtons[params.get("q")](interaction, params);
  }
  return;
}
