export class TeamDivider {
    message_id: string;
    member_id: string;
    member_name: string;
    team: number;
    match_num: number;
    joined_match_count: number;
    win: number;
    force_spectate: boolean;
    hide_win: boolean;
    win_rate: number;
    created_at: string;
    constructor(
        message_id: string,
        member_id: string,
        member_name: string,
        team: number,
        match_num: number,
        joined_match_count: number,
        win: number,
        force_spectate: boolean,
        hide_win: boolean,
        win_rate: number,
        created_at: string,
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
}
