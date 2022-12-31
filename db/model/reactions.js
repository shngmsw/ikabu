module.exports = class Reactions {
    constructor(reaction_seq, user_id, channel_id, year, count) {
        this.user_id = user_id;
        this.reaction_seq = reaction_seq;
        this.channel_id = channel_id;
        this.year = year;
        this.count = count;
    }
};
