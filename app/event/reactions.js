const ReactionsService = require('../../db/reactions_service');
const TotalReactionsService = require('../../db/total_reactions_service');
const TotalReactions = require('../../db/model/total_reactions');
const { isEmpty } = require('../common');

module.exports = async function emojiCountUp(reaction) {
    let user_id = reaction.message.author.id;
    let emoji_id = reaction._emoji.id;
    let emoji_name = reaction._emoji.name;
    let channel_id = reaction.message.channelId;
    let year = new Date().getFullYear();
    // reactions,total_reactionsテーブルがなければ作る
    await TotalReactionsService.createTableIfNotExists();
    await ReactionsService.createTableIfNotExists();
    // total_reactionからseq取得、なければ新規作成
    let result = await getTotalReaction(emoji_id, emoji_name);
    let count = await getReactionCount(user_id, result.reaction_seq, channel_id, year);
    await TotalReactionsService.update(result.reaction_seq, result.count + 1);
    await ReactionsService.save(user_id, result.reaction_seq, channel_id, year, count);
};

async function getReactionCount(user_id, reaction_seq, channel_id, year) {
    let count = 1;
    let result = await ReactionsService.getReactionCountByPK(user_id, reaction_seq, channel_id, year);
    if (result[0] != null) {
        count = result[0].count + 1;
    }
    return count;
}

async function getTotalReaction(emoji_id, emoji_name) {
    let result = await TotalReactionsService.getTotalReactionByEmoji(emoji_id, emoji_name);
    if (isEmpty(result)) {
        await TotalReactionsService.save(emoji_id, emoji_name, 0);
        result = await TotalReactionsService.getTotalReactionByEmoji(emoji_id, emoji_name);
    }
    return result[0];
}
