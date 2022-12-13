module.exports = {
    searchMemberById: searchMemberById,
    getMemberColor: getMemberColor,
};

const { isNotEmpty, isEmpty } = require('../common');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('MemberManager');

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ユーザーID
 * @returns メンバーオブジェクト
 */
async function searchMemberById(guild, userId) {
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
function getMemberColor(member) {
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
