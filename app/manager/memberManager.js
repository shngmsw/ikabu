const { isNotEmpty, isEmpty } = require('../common');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('MemberManager');

module.exports = {
    searchMemberById: searchMemberById,
    getMemberColor: getMemberColor,
};

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ユーザーID
 * @returns メンバーオブジェクト
 */
async function searchMemberById(guild, userId) {
    // APIからのメンバーオブジェクト(discord.jsのGuildMemberでないもの)がそのまま渡ってくることがあるのでfetchすることで確実にGuildMemberとする。
    const members = await guild.members.fetch();
    let member = members.find((member) => member.id === userId);

    return member;
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
