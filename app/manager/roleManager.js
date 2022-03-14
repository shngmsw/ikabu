/**
 * ロールを作成し，作成したロールのIDを返す．
 * 既に同じロール名のロールが有る場合，そのロールIDを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
module.exports.createRole = async function (guild, roleName) {
    if (roleName == '') {
        return null;
    }

    if (searchRoleIdByName(guild, roleName) != null) {
        return searchRoleIdByName(guild, roleName);
    } else {
        var role = await guild.roles.create({ name: roleName });
        return role.id;
    }
};

/**
 * ロール名からロールIDを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
function searchRoleIdByName(guild, roleName) {
    var role = guild.roles.cache.find((role) => role.name === roleName);

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
module.exports.searchRoleById = function (guild, roleId) {
    var role = guild.roles.cache.find((role) => role.id === roleId);

    if (role != null) {
        return role;
    } else {
        return null;
    }
};

/**
 * 渡されたロールに色を設定する．色がnullのときはランダムな色を設定する
 * @param {Role} role Roleオブジェクト
 * @param {string} color カラーコード
 * @returns セットしたカラーコード
 */
module.exports.setColorToRole = async function (guild, role, color) {
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
};

/**
 * メンバーにロールを付与するコマンド，メンバーが見つからない場合エラーメッセージを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ロールID
 * @param {string} memberId メンバーID
 * @returns メンバーID
 */
module.exports.setRoleToMember = function (guild, roleId, memberId) {
    if (memberId == null || memberId == '') {
        return null;
    } else {
        const member = guild.members.cache.get(memberId);

        if (member != null) {
            member.roles.add(guild.roles.cache.get(roleId));
            return member.id;
        } else {
            return memberId + '(NOT_FOUND)';
        }
    }
};
