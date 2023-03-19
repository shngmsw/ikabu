// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    searchMemberById: searchMemberById,
    getMemberColor: getMemberColor,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, isEmpty } = require('../others');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('MemberManager');

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ユーザーID
 * @returns メンバーオブジェクト
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
async function searchMemberById(guild: $TSFixMe, userId: $TSFixMe) {
    try {
        let member;
        try {
            // fetch(mid)とすれば、cache見てなければフェッチしてくる
            member = await guild.members.fetch(userId);
        } catch (error) {
            logger.warn('member missing');
        }

        return member;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * メンバーのカラー(名前の色)を返す
 * @param {*} member 対象メンバー
 * @returns {String} HEX COLOR CODE
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getMemberC... Remove this comment to see the full error message
function getMemberColor(member: $TSFixMe) {
    /* member.displayColorでもとれるけど、@everyoneが#000000(BLACK)になるので
       ロール有無チェックしてなければ#FFFFFF(WHITE)を返す */
    try {
        if (isNotEmpty(member)) {
            let role = member.roles.color;
            if (isEmpty(role)) {
                return '#FFFFFF';
            } else {
                return role.hexColor;
            }
        } else {
            return '#FFFFFF';
        }
    } catch (error) {
        logger.error(error);
    }
}
