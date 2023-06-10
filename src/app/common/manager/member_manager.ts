import axios from 'axios';
import { Guild, GuildMember } from 'discord.js';

import { MembersService } from '../../../db/members_service';
import { Member } from '../../../db/model/member';
import { log4js_obj } from '../../../log4js_settings';
import { assertExistCheck, notExists } from '../others';

const logger = log4js_obj.getLogger('MemberManager');

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param guild Guildオブジェクト
 * @param roleId ユーザーID
 * @returns メンバーオブジェクト
 */
export async function searchAPIMemberById(guild: Guild, userId: string) {
    let member;
    try {
        // fetch(mid)とすれば、cache見てなければフェッチしてくる
        member = await guild.members.fetch(userId);
    } catch (error) {
        member = null;
        logger.warn('member missing (Discord API)');
    }

    return member;
}

/**
 * DBからMember型のオブジェクトを探してくる、なければAPIから拾ってきて登録し、Member型で返す
 * @param guild Guildオブジェクト
 * @param userId ユーザーID
 * @returns Member型オブジェクト
 */
export async function searchDBMemberById(guild: Guild, userId: string): Promise<Member | null> {
    const members = await MembersService.getMemberByUserId(guild.id, userId);

    // membersテーブルにレコードがあるか確認
    if (members.length == 0) {
        const memberRaw = await searchAPIMemberById(guild, userId);

        if (notExists(memberRaw)) {
            logger.warn('member missing (ikabu DB) => member missing (Discord API)');
            return null;
        }
        assertExistCheck(memberRaw.joinedAt, 'joinedAt');

        const newMember = new Member(
            guild.id,
            userId,
            memberRaw.displayName,
            memberRaw.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
            memberRaw.joinedAt,
        );

        await MembersService.registerMember(newMember);

        return newMember;
    } else {
        if (await isUrlValid(members[0].iconUrl)) {
            return members[0];
        } else {
            // 画像URLが無効な場合
            const memberRaw = await searchAPIMemberById(guild, userId);

            if (notExists(memberRaw)) {
                logger.warn('member Icon invalid => member missing (Discord API)');
                return null;
            }

            const newMember = new Member(
                guild.id,
                userId,
                memberRaw.displayName,
                memberRaw.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
                members[0].joinedAt,
            );

            await MembersService.updateMemberProfile(newMember);

            logger.warn('member Icon invalid => Icon URL was updated successfully.');

            return newMember;
        }
    }
}

/**
 * メンバーのカラー(名前の色)を返す
 * @param member 対象メンバー
 * @returns HEX COLOR CODE
 */
export function getMemberColor(member: GuildMember) {
    /* member.displayColorでもとれるけど、@everyoneが#000000(BLACK)になるので
       ロール有無チェックしてなければ#FFFFFF(WHITE)を返す */
    try {
        const role = member.roles.color;
        if (notExists(role)) {
            return '#FFFFFF';
        } else {
            return role.hexColor;
        }
    } catch (error) {
        logger.error(error);
        return '#FFFFFF';
    }
}

async function isUrlValid(url: string) {
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}
