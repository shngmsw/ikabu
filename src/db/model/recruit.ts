// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class Recruit {
    constructor(user_id: $TSFixMe, author_id: $TSFixMe, member_id: $TSFixMe, created_at: $TSFixMe) {
        // @ts-expect-error TS(2339): Property 'user_id' does not exist on type 'Recruit... Remove this comment to see the full error message
        this.user_id = user_id;
        // @ts-expect-error TS(2339): Property 'author_id' does not exist on type 'Recru... Remove this comment to see the full error message
        this.author_id = author_id;
        // @ts-expect-error TS(2339): Property 'member_id' does not exist on type 'Recru... Remove this comment to see the full error message
        this.member_id = member_id;
        // @ts-expect-error TS(2339): Property 'created_at' does not exist on type 'Recr... Remove this comment to see the full error message
        this.created_at = created_at;
    }
};
