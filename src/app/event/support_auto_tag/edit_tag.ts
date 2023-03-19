// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
const { isEmpty } = require('../../common/others');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'tagIdsEmbe... Remove this comment to see the full error message
const { tagIdsEmbed } = require('./tag_ids_embed');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    editThreadTag: editThreadTag,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('default');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'editThread... Remove this comment to see the full error message
async function editThreadTag(thread: $TSFixMe) {
    try {
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        if (isEmpty(process.env.TAG_ID_SUPPORT_PROGRESS) || isEmpty(process.env.TAG_ID_SUPPORT_RESOLVED)) {
            await thread.send({ embeds: [tagIdsEmbed(thread)] });
            return;
        }

        let appliedTags = thread.appliedTags;
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        appliedTags.push(process.env.TAG_ID_SUPPORT_PROGRESS);
        await thread.setAppliedTags(appliedTags, '質問対応開始');
    } catch (error) {
        logger.error(error);
    }
}
