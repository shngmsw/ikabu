const { URLSearchParams } = require('url');
const { isNotEmpty } = require('../common/others');
const {
    modalRegularRecruit,
    modalAnarchyRecruit,
    modalSalmonRecruit,
    modalFesRecruit,
} = require('../feat-recruit/interactions/modals/extract_recruit_modal');
const log4js = require('log4js');

module.exports = {
    call: call,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction) {
    const params = new URLSearchParams(interaction.customId);
    if (isNotEmpty(params.get('recm'))) {
        const recruitModals = {
            regrec: modalRegularRecruit,
            anarec: modalAnarchyRecruit,
            salrec: modalSalmonRecruit,
            fesrec: modalFesRecruit,
        };
        await recruitModals[params.get('recm')](interaction, params);
    }
    return;
}
