import { ColorResolvable, Guild, GuildMember, Role } from 'discord.js';

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
export async function createRole(guild: Guild, roleName: string) {
    if (roleName === '') {
        roleName = '新規ロール';
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
export async function setColorToRole(guild: Guild, role: Role, color?: string | ColorResolvable | null) {
    if (exists(color)) {
        try {
            await role.setColor(color as ColorResolvable);
        } catch (error) {
            await role.setColor('Random');
            logger.warn('role color format is invalid. set random color.');
        }
        await guild.roles.fetch();
        return role.hexColor;
    } else {
        await role.setColor('Random');
        await guild.roles.fetch();
        return role.hexColor;
    }
}

/**
 * メンバーにロールを付与するコマンド，メンバーが見つからない場合エラーメッセージを返す
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ロールID
 * @param {string} memberId メンバーID
 * @returns メンバーID
 */
export async function setRoleToMember(guild: Guild, roleId: string, memberId: string) {
    if (notExists(memberId) || memberId === '') {
        return null;
    } else {
        let member: GuildMember | null | undefined;

        // 数値判定
        if (!isNaN(Number(memberId))) {
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
            member = members.find((member: GuildMember) => member.user.tag === memberId);
        }

        if (exists(member)) {
            const role = await guild.roles.fetch(roleId);
            if (notExists(role)) {
                return memberId + '(ROLE_NOT_FOUND)';
            }
            await member.roles.add(role);
            return member.id;
        } else {
            return memberId + '(NOT_FOUND)';
        }
    }
}
