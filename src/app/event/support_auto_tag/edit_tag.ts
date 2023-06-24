import { AnyThreadChannel } from 'discord.js';

import { tagIdsEmbed } from './tag_ids_embed';
import { log4js_obj } from '../../../log4js_settings';
import { exists, notExists } from '../../common/others';

const logger = log4js_obj.getLogger('default');

export async function editThreadTag(thread: AnyThreadChannel<boolean>) {
    try {
        if (notExists(process.env.TAG_ID_SUPPORT_PROGRESS) || notExists(process.env.TAG_ID_SUPPORT_RESOLVED)) {
            const embed = tagIdsEmbed(thread);
            if (exists(embed)) {
                await thread.send({ embeds: [embed] });
            }
            return;
        }

        const appliedTags = thread.appliedTags;
        appliedTags.push(process.env.TAG_ID_SUPPORT_PROGRESS);
        await thread.setAppliedTags(appliedTags, '質問対応開始');
    } catch (error) {
        logger.error(error);
    }
}
