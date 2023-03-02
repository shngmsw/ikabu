const { buttonEnable } = require('../feat-admin/button_enabler/enable_button');
const { commandNames } = require('../../constant');
const log4js = require('log4js');

module.exports = {
    call: call,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction) {
    if (interaction.commandName == commandNames.buttonEnabler) {
        buttonEnable(interaction);
    }
    return;
}
