// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class FriendCode {
    constructor(user_id: $TSFixMe, code: $TSFixMe) {
        // @ts-expect-error TS(2339): Property 'user_id' does not exist on type 'FriendC... Remove this comment to see the full error message
        this.user_id = user_id;
        // @ts-expect-error TS(2339): Property 'code' does not exist on type 'FriendCode... Remove this comment to see the full error message
        this.code = code;
    }
};
