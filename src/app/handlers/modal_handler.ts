// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'URLSearchP... Remove this comment to see the full error message
const { URLSearchParams } = require('url');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty } = require('../common/others');
const {
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'modalRegul... Remove this comment to see the full error message
    modalRegularRecruit,
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'modalAnarc... Remove this comment to see the full error message
    modalAnarchyRecruit,
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'modalSalmo... Remove this comment to see the full error message
    modalSalmonRecruit,
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'modalFesRe... Remove this comment to see the full error message
    modalFesRecruit,
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require('../feat-recruit/interactions/modals/extract_recruit_modal');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    call: call,
};

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);

async function call(interaction: $TSFixMe) {
    const params = new URLSearchParams(interaction.customId);
    if (isNotEmpty(params.get('recm'))) {
        const recruitModals = {
            regrec: modalRegularRecruit,
            anarec: modalAnarchyRecruit,
            salrec: modalSalmonRecruit,
            fesrec: modalFesRecruit,
        };
        // @ts-expect-error TS(2538): Type 'null' cannot be used as an index type.
        await recruitModals[params.get('recm')](interaction, params);
    }
    return;
}
