// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class TeamDivider {
    constructor(
        message_id: $TSFixMe,
        member_id: $TSFixMe,
        member_name: $TSFixMe,
        team: $TSFixMe,
        match_num: $TSFixMe,
        joined_match_count: $TSFixMe,
        win: $TSFixMe,
        force_spectate: $TSFixMe,
        hide_win: $TSFixMe,
        win_rate: $TSFixMe,
        created_at: $TSFixMe,
    ) {
        // @ts-expect-error TS(2339): Property 'message_id' does not exist on type 'Team... Remove this comment to see the full error message
        this.message_id = message_id;
        // @ts-expect-error TS(2339): Property 'member_id' does not exist on type 'TeamD... Remove this comment to see the full error message
        this.member_id = member_id;
        // @ts-expect-error TS(2339): Property 'member_name' does not exist on type 'Tea... Remove this comment to see the full error message
        this.member_name = member_name;
        // @ts-expect-error TS(2339): Property 'team' does not exist on type 'TeamDivide... Remove this comment to see the full error message
        this.team = team;
        // @ts-expect-error TS(2339): Property 'match_num' does not exist on type 'TeamD... Remove this comment to see the full error message
        this.match_num = match_num;
        // @ts-expect-error TS(2339): Property 'joined_match_count' does not exist on ty... Remove this comment to see the full error message
        this.joined_match_count = joined_match_count;
        // @ts-expect-error TS(2339): Property 'win' does not exist on type 'TeamDivider... Remove this comment to see the full error message
        this.win = win;
        // @ts-expect-error TS(2339): Property 'force_spectate' does not exist on type '... Remove this comment to see the full error message
        this.force_spectate = force_spectate;
        // @ts-expect-error TS(2339): Property 'hide_win' does not exist on type 'TeamDi... Remove this comment to see the full error message
        this.hide_win = hide_win;
        // @ts-expect-error TS(2339): Property 'win_rate' does not exist on type 'TeamDi... Remove this comment to see the full error message
        this.win_rate = win_rate;
        // @ts-expect-error TS(2339): Property 'created_at' does not exist on type 'Team... Remove this comment to see the full error message
        this.created_at = created_at;
    }
};
