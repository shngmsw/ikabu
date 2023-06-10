import { Guild, Role } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { exists, notExists } from '../others';
const logger = log4js_obj.getLogger('RoleManager');

/**
 * ロールを作成し，作成したロールのIDを返す．
 * 既に同じロール名のロールが有る場合，そのロールIDを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
export async function createRole(guild: $TSFixMe, roleName: $TSFixMe) {
    if (roleName == '') {
        return null;
    }

    const roleId = await searchRoleIdByName(guild, roleName);
    if (exists(roleId)) {
        return roleId;
    } else {
        const role = await guild.roles.create({ name: roleName });
        return role.id;
    }
}

/**
 * ロール名からロールIDを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleName ロール名
 * @returns ロールID
 */
export async function searchRoleIdByName(guild: Guild, roleName: string) {
    const roles = await guild.roles.fetch();
    const role = roles.find((role: Role) => role.name === roleName);

    if (exists(role)) {
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
export async function searchRoleById(guild: Guild, roleId: string) {
    let role = null;
    try {
        // fetch(mid)とすれば、cache見てなければフェッチしてくる
        role = await guild.roles.fetch(roleId);
    } catch (error) {
        logger.warn('role missing');
    }

    return role;
}

/**
 * 渡されたロールに色を設定する．色がnullのときはランダムな色を設定する
 * @param {Role} role Roleオブジェクト
 * @param {string} color カラーコード
 * @returns セットしたカラーコード
 */
export async function setColorToRole(guild: $TSFixMe, role: $TSFixMe, color?: string) {
    if (exists(color)) {
        await role.setColor(color);
        await guild.roles.fetch();
        return color;
    } else {
        const colorList = [
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
        const pickedColor = colorList[Math.floor(Math.random() * colorList.length)];
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
export async function setRoleToMember(guild: $TSFixMe, roleId: $TSFixMe, memberId: $TSFixMe) {
    if (notExists(memberId) || memberId == '') {
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

        if (exists(member)) {
            member.roles.add(await guild.roles.fetch(roleId));
            return member.id;
        } else {
            return memberId + '(NOT_FOUND)';
        }
    }
}
