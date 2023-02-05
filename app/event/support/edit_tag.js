const { isEmpty } = require('../../common');
const { tagIdsEmbed } = require('./tag_ids_embed');
const log4js = require('log4js');

module.exports = {
    editThreadTag: editThreadTag,
};

const logger = log4js.getLogger('default');

async function editThreadTag(thread) {
    try {
        if (isEmpty(process.env.TAG_ID_SUPPORT_PROGRESS) || isEmpty(process.env.TAG_ID_SUPPORT_RESOLVED)) {
            await thread.send({ embeds: [tagIdsEmbed(thread)] });
            return;
        }

        let appliedTags = thread.appliedTags;
        appliedTags.push(process.env.TAG_ID_SUPPORT_PROGRESS);
        await thread.setAppliedTags(appliedTags, '質問対応開始');
    } catch (error) {
        logger.error(error);
    }
}
