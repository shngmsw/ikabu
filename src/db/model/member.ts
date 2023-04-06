export class Member {
    guildId: string;
    userId: string;
    userName: string;
    iconUrl: string;
    joinedAt: Date | null;
    constructor(guildId: string, userId: string, userName: string, iconUrl: string, joinedAt: string | Date) {
        this.guildId = guildId;
        this.userId = userId;
        this.userName = userName;
        this.iconUrl = iconUrl;
        if (joinedAt instanceof Date) {
            this.joinedAt = joinedAt;
        } else if (typeof joinedAt === 'string') {
            this.joinedAt = new Date(joinedAt);
        } else {
            this.joinedAt = null;
        }
    }
}
