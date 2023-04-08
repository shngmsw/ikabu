export class Participant {
    messageId: string;
    userId: string;
    userType: number;
    joinedAt: Date;
    constructor(messageId: string, userId: string, userType: number, joinedAt: string | Date) {
        this.messageId = messageId;
        this.userId = userId;
        this.userType = userType;
        if (joinedAt instanceof Date) {
            this.joinedAt = joinedAt;
        } else {
            this.joinedAt = new Date(joinedAt);
        }
    }
}
