export class Member {
    guild_id: string;
    user_id: string;
    display_name: string;
    icon_url: string;
    joined_at: Date | null;
    constructor(guildId: string, userId: string, userName: string, iconUrl: string, joinedAt: string | Date) {
        this.guild_id = guildId;
        this.user_id = userId;
        this.display_name = userName;
        this.icon_url = iconUrl;
        if (joinedAt instanceof Date) {
            this.joined_at = joinedAt;
        } else if (typeof joinedAt === 'string') {
            this.joined_at = new Date(joinedAt);
        } else {
            this.joined_at = null;
        }
    }
}
