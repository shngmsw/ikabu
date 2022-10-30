module.exports = class TeamDivider {
    constructor(
        message_id,
        member_id,
        member_name,
        team,
        match_num,
        joined_match_count,
        win,
        force_spectate,
        hide_win,
        win_rate,
        created_at,
    ) {
        this.message_id = message_id;
        this.member_id = member_id;
        this.member_name = member_name;
        this.team = team;
        this.match_num = match_num;
        this.joined_match_count = joined_match_count;
        this.win = win;
        this.force_spectate = force_spectate;
        this.hide_win = hide_win;
        this.win_rate = win_rate;
        this.created_at = created_at;
    }
};
