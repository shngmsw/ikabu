export class Participant {
    userId: string;
    displayName: string;
    iconUrl: string;
    userType: number;
    joinedAt: Date;
    constructor(userId: string, displayName: string, iconUrl: string, userType: number, joinedAt: string | Date) {
        this.userId = userId;
        this.displayName = displayName;
        this.iconUrl = iconUrl;
        this.userType = userType;
        if (joinedAt instanceof Date) {
            this.joinedAt = joinedAt;
        } else {
            this.joinedAt = new Date(joinedAt);
        }
    }
}
