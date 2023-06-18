export class MessageCount {
    user_id: string;
    count: number;
    constructor(user_id: string, count: number) {
        this.user_id = user_id;
        this.count = count;
    }
}
