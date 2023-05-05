import { exists, isEmpty } from '../../common/others';

import { ReactionsService } from '../../../db/reactions_service';
import { TotalReactionsService } from '../../../db/total_reactions_service';

export async function emojiCountUp(reaction: $TSFixMe) {
    const user_id = reaction.message.author.id;
    const emoji_id = reaction._emoji.id;
    const emoji_name = reaction._emoji.name;
    const channel_id = reaction.message.channelId;
    const year = new Date().getFullYear();
    // reactions,total_reactionsテーブルがなければ作る
    await TotalReactionsService.createTableIfNotExists();
    await ReactionsService.createTableIfNotExists();
    // total_reactionからseq取得、なければ新規作成
    const result = await getTotalReaction(emoji_id, emoji_name);
    const count = await getReactionCount(user_id, result.reaction_seq, channel_id, year);
    await TotalReactionsService.update(result.reaction_seq, result.count + 1);
    await ReactionsService.save(user_id, result.reaction_seq, channel_id, year, count);
}

async function getReactionCount(user_id: $TSFixMe, reaction_seq: $TSFixMe, channel_id: $TSFixMe, year: $TSFixMe) {
    let count = 1;
    const result = await ReactionsService.getReactionCountByPK(user_id, reaction_seq, channel_id, year);
    if (exists(result[0])) {
        count = result[0].count + 1;
    }
    return count;
}

async function getTotalReaction(emoji_id: $TSFixMe, emoji_name: $TSFixMe) {
    let result = await TotalReactionsService.getTotalReactionByEmoji(emoji_id, emoji_name);
    if (isEmpty(result)) {
        await TotalReactionsService.save(emoji_id, emoji_name, 0);
        result = await TotalReactionsService.getTotalReactionByEmoji(emoji_id, emoji_name);
    }
    return result[0];
}
