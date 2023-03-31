export class Recruit {
    user_id: string;
    author_id: string;
    member_id: string;
    created_at: string;
    constructor(user_id: string, author_id: string, member_id: string, created_at: string) {
        this.user_id = user_id;
        this.author_id = author_id;
        this.member_id = member_id;
        this.created_at = created_at;
    }
}
