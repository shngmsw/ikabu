// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'buttonEnab... Remove this comment to see the full error message
const { buttonEnable } = require('../feat-admin/button_enabler/enable_button');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'commandNam... Remove this comment to see the full error message
const { commandNames } = require('../../constant');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    call: call,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction: $TSFixMe) {
    if (interaction.commandName == commandNames.buttonEnabler) {
        buttonEnable(interaction);
    }
    return;
}
