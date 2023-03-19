// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class Reactions {
    constructor(reaction_seq: $TSFixMe, user_id: $TSFixMe, channel_id: $TSFixMe, year: $TSFixMe, count: $TSFixMe) {
        // @ts-expect-error TS(2339): Property 'user_id' does not exist on type 'Reactio... Remove this comment to see the full error message
        this.user_id = user_id;
        // @ts-expect-error TS(2339): Property 'reaction_seq' does not exist on type 'Re... Remove this comment to see the full error message
        this.reaction_seq = reaction_seq;
        // @ts-expect-error TS(2339): Property 'channel_id' does not exist on type 'Reac... Remove this comment to see the full error message
        this.channel_id = channel_id;
        // @ts-expect-error TS(2339): Property 'year' does not exist on type 'Reactions'... Remove this comment to see the full error message
        this.year = year;
        // @ts-expect-error TS(2339): Property 'count' does not exist on type 'Reactions... Remove this comment to see the full error message
        this.count = count;
    }
};
