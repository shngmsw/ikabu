export class Recruit {
    messageId: string;
    authorId: string;
    recruitNum: number;
    condition: string;
    createdAt: Date;
    constructor(messageId: string, authorId: string, recruitNum: number, condition: string, createdAt: string | Date) {
        this.messageId = messageId;
        this.authorId = authorId;
        this.recruitNum = recruitNum;
        this.condition = condition;
        if (createdAt instanceof Date) {
            this.createdAt = createdAt;
        } else {
            this.createdAt = new Date(createdAt);
        }
    }
}
