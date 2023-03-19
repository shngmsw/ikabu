// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class TotalReactions {
    constructor(reaction_seq: $TSFixMe, emoji_id: $TSFixMe, emoji_name: $TSFixMe, count: $TSFixMe) {
        // @ts-expect-error TS(2339): Property 'reaction_seq' does not exist on type 'To... Remove this comment to see the full error message
        this.reaction_seq = reaction_seq;
        // @ts-expect-error TS(2339): Property 'emoji_id' does not exist on type 'TotalR... Remove this comment to see the full error message
        this.emoji_id = emoji_id;
        // @ts-expect-error TS(2339): Property 'emoji_name' does not exist on type 'Tota... Remove this comment to see the full error message
        this.emoji_name = emoji_name;
        // @ts-expect-error TS(2339): Property 'count' does not exist on type 'TotalReac... Remove this comment to see the full error message
        this.count = count;
    }
};
