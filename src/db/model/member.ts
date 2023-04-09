export class Member {
    guildId: string;
    userId: string;
    displayName: string;
    iconUrl: string;
    joinedAt: Date;

    constructor(guildId: string, userId: string, userName: string, iconUrl: string, joinedAt: string | Date) {
        this.guildId = guildId;
        this.userId = userId;
        this.displayName = userName;
        this.iconUrl = iconUrl;
        if (joinedAt instanceof Date) {
            this.joinedAt = joinedAt;
        } else {
            this.joinedAt = new Date(joinedAt);
        }
    }
}
