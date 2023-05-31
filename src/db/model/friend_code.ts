export class FriendCode {
    user_id: string;
    code: string;
    url: string | null;
    constructor(user_id: string, code: string, url: string | null) {
        this.user_id = user_id;
        this.code = code;
        this.url = url;
    }
}
