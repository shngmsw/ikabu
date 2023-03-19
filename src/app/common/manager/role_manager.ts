// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('RoleManager');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    createRole: createRole,
    searchRoleIdByName: searchRoleIdByName,
    searchRoleById: searchRoleById,
    setColorToRole: setColorToRole,
    setRoleToMember: setRoleToMember,
};

/**
 * ロールを作成し，作成したロールのIDを返す．
 * 既に同じロール名のロールが有る場合，そのロールIDを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createRole... Remove this comment to see the full error message
async function createRole(guild: $TSFixMe, roleName: $TSFixMe) {
    if (roleName == '') {
        return null;
    }

    if ((await searchRoleIdByName(guild, roleName)) != null) {
        return searchRoleIdByName(guild, roleName);
    } else {
        var role = await guild.roles.create({ name: roleName });
        return role.id;
    }
}

/**
 * ロール名からロールIDを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchRole... Remove this comment to see the full error message
async function searchRoleIdByName(guild: $TSFixMe, roleName: $TSFixMe) {
    const roles = await guild.roles.fetch();
    var role = roles.find((role: $TSFixMe) => role.name === roleName);

    if (role != null) {
        return role.id;
    } else {
        return null;
    }
}

/**
 * ロールIDからロールを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ロールID
 * @returns ロールオブジェクト
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchRole... Remove this comment to see the full error message
async function searchRoleById(guild: $TSFixMe, roleId: $TSFixMe) {
    try {
        let role;
        try {
            // fetch(mid)とすれば、cache見てなければフェッチしてくる
            role = await guild.roles.fetch(roleId);
        } catch (error) {
            logger.warn('role missing');
        }

        return role;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * 渡されたロールに色を設定する．色がnullのときはランダムな色を設定する
 * @param {Role} role Roleオブジェクト
 * @param {string} color カラーコード
 * @returns セットしたカラーコード
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setColorTo... Remove this comment to see the full error message
async function setColorToRole(guild: $TSFixMe, role: $TSFixMe, color = null) {
    if (color != null) {
        await role.setColor(color);
        await guild.roles.fetch();
        return color;
    } else {
        var colorList = [
            '#E60012',
            '#EB6100',
            '#F39800',
            '#FCC800',
            '#FFF100',
            '#CFDB00',
            '#8FC31F',
            '#22AC38',
            '#009944',
            '#009B6B',
            '#009E96',
            '#00A0C1',
            '#00A0E9',
            '#0086D1',
            '#0068B7',
            '#00479D',
            '#1D2088',
            '#601986',
            '#920783',
            '#BE0081',
            '#E4007F',
            '#E5006A',
            '#E5004F',
            '#E60033',
        ];
        var pickedColor = colorList[Math.floor(Math.random() * colorList.length)];
        await role.setColor(pickedColor);
        await guild.roles.fetch();
        return await role.hexColor;
    }
}

/**
 * メンバーにロールを付与するコマンド，メンバーが見つからない場合エラーメッセージを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ロールID
 * @param {string} memberId メンバーID
 * @returns メンバーID
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setRoleToM... Remove this comment to see the full error message
async function setRoleToMember(guild: $TSFixMe, roleId: $TSFixMe, memberId: $TSFixMe) {
    if (memberId == null || memberId == '') {
        return null;
    } else {
        let member;

        // 数値判定
        if (!isNaN(memberId)) {
            // 桁数判定
            if (memberId.length == 18 || memberId.length == 19) {
                try {
                    member = await guild.members.fetch(memberId);
                } catch (error) {
                    logger.warn('member missing');
                    member = null;
                }
            } else {
                member = null;
            }
        } else {
            const members = await guild.members.fetch();
            // ユーザータグからメンバー取得
            member = members.find((member: $TSFixMe) => member.user.tag === memberId);
        }

        if (member != null) {
            member.roles.add(await guild.roles.fetch(roleId));
            return member.id;
        } else {
            return memberId + '(NOT_FOUND)';
        }
    }
}
