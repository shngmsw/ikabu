import { Member } from '@prisma/client';
import axios from 'axios';
import { Guild, GuildMember, Message } from 'discord.js';

import { MemberService } from '../../../db/member_service';
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

export async function getAPIMemberByMessage(message: Message<true>) {
    const guild = message.guild;
    const memberId = message.author.id;
    let member = message.member;
    if (notExists(member)) {
        member = await guild.members.fetch(memberId);
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
    const member = await MemberService.getMemberByUserId(guild.id, userId);

    // membersテーブルにレコードがあるか確認
    if (notExists(member)) {
        const memberRaw = await searchAPIMemberById(guild, userId);

        if (notExists(memberRaw)) {
            logger.warn('member missing (ikabu DB) => member missing (Discord API)');
            return null;
        }
        assertExistCheck(memberRaw.joinedAt, 'joinedAt');

        const newMember: Member = {
            guildId: guild.id,
            userId: userId,
            displayName: memberRaw.displayName,
            iconUrl: memberRaw.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
            joinedAt: memberRaw.joinedAt,
        };

        await MemberService.registerMember(newMember);

        return newMember;
    } else {
        if (await isUrlValid(member.iconUrl)) {
            return member;
        } else {
            // 画像URLが無効な場合
            const memberRaw = await searchAPIMemberById(guild, userId);

            if (notExists(memberRaw)) {
                logger.warn('member Icon invalid => member missing (Discord API)');
                return null;
            }

            const newMember: Member = {
                guildId: guild.id,
                userId: userId,
                displayName: memberRaw.displayName,
                iconUrl: memberRaw
                    .displayAvatarURL()
                    .replace('.webp', '.png')
                    .replace('.webm', '.gif'),
                joinedAt: member.joinedAt,
            };

            await MemberService.updateMemberProfile(newMember);

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
