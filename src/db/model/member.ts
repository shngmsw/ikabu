export class Member {
    guild_id: string;
    user_id: string;
    display_name: string;
    icon_url: string;
    joined_at: string;
    constructor(guildId: string, userId: string, userName: string, iconUrl: string, joinedAt: string | Date) {
        this.guild_id = guildId;
        this.user_id = userId;
        this.display_name = userName;
        this.icon_url = iconUrl;
        if (joinedAt instanceof Date) {
            this.joined_at = joinedAt.toString();
        } else {
            this.joined_at = joinedAt;
        }
    }
}
