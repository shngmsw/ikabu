module.exports = class TotalReactions {
    constructor(reaction_seq, emoji_id, emoji_name, count) {
        this.reaction_seq = reaction_seq;
        this.emoji_id = emoji_id;
        this.emoji_name = emoji_name;
        this.count = count;
    }
};
