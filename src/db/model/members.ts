// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class Members {
    constructor(user_id: $TSFixMe, message_count: $TSFixMe) {
        // @ts-expect-error TS(2339): Property 'user_id' does not exist on type 'Members... Remove this comment to see the full error message
        this.user_id = user_id;
        // @ts-expect-error TS(2339): Property 'message_count' does not exist on type 'M... Remove this comment to see the full error message
        this.message_count = message_count;
    }
};
