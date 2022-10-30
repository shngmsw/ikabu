module.exports = class Recruit {
    constructor(user_id, author_id, member_id, created_at) {
        this.user_id = user_id;
        this.author_id = author_id;
        this.member_id = member_id;
        this.created_at = created_at;
    }
};
