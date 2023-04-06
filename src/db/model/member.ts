export class Member {
    guildId: string;
    userId: string;
    userName: string;
    iconUrl: string;
    joinedAt: Date | null;
    constructor(guildId: string, userId: string, userName: string, iconUrl: string, joinedAt: string) {
        this.guildId = guildId;
        this.userId = userId;
        this.userName = userName;
        this.iconUrl = iconUrl;
        this.joinedAt = new Date(joinedAt);
    }
}
