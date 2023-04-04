import { log4js_obj } from '../../../log4js_settings';
import { isEmpty, isNotEmpty } from '../others';

const logger = log4js_obj.getLogger('MemberManager');

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ユーザーID
 * @returns メンバーオブジェクト
 */
export async function searchMemberById(guild: $TSFixMe, userId: $TSFixMe) {
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
export function getMemberColor(member: $TSFixMe) {
    /* member.displayColorでもとれるけど、@everyoneが#000000(BLACK)になるので
       ロール有無チェックしてなければ#FFFFFF(WHITE)を返す */
    try {
        if (isNotEmpty(member)) {
            const role = member.roles.color;
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
