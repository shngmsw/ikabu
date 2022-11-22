const { isNotEmpty, isEmpty } = require('../common');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('MemberManager');

module.exports = {
    searchMemberById: searchMemberById,
    checkColor: checkColor,
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

function checkColor(member) {
    try {
        if (isNotEmpty(member)) {
            let role = member.roles.color;
            if (isEmpty(role)) return '#FFFFFF';
            else return role.hexColor;
        } else {
            return '#FFFFFF';
        }
    } catch (error) {
        logger.error(error);
    }
}
