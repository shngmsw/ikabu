export class Recruit {
    guildId: string;
    channelId: string;
    messageId: string;
    authorId: string;
    recruitNum: number;
    condition: string;
    channelName: string | null;
    recruitType: number;
    option: string | null;
    createdAt: Date;
    constructor(
        guildId: string,
        channelId: string,
        messageId: string,
        authorId: string,
        recruitNum: number,
        condition: string,
        channelName: string | null,
        recruitType: number,
        option: string | null,
        createdAt: string | Date,
    ) {
        this.guildId = guildId;
        this.channelId = channelId;
        this.messageId = messageId;
        this.authorId = authorId;
        this.recruitNum = recruitNum;
        this.condition = condition;
        this.channelName = channelName;
        this.recruitType = recruitType;
        this.option = option;
        if (createdAt instanceof Date) {
            this.createdAt = createdAt;
        } else {
            this.createdAt = new Date(createdAt);
        }
    }
}

export const RecruitType = {
    ButtonNotify: 0,
    PrivateRecruit: 1,
    RegularRecruit: 2,
    AnarchyRecruit: 3,
    EventRecruit: 4,
    SalmonRecruit: 5,
    FestivalRecruit: 6,
    BigRunRecruit: 7,
    TeamContestRecruit: 8,
    OtherGameRecruit: 10,
};
