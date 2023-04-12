import { Guild, GuildMember } from 'discord.js';
import { log4js_obj } from '../../../log4js_settings';
import { isEmpty, isNotEmpty } from '../others';
import { MembersService } from '../../../db/members_service';
import { Member } from '../../../db/model/member';

const logger = log4js_obj.getLogger('MemberManager');

/**
 * ユーザーIDからメンバーを検索する．ない場合はnullを返す．
 * @param {Guild} guild Guildオブジェクト
 * @param {string} roleId ユーザーID
 * @returns メンバーオブジェクト
 */
export async function searchAPIMemberById(guild: $TSFixMe, userId: $TSFixMe) {
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
 * DBからMember型のオブジェクトを探してくる、なければAPIから拾ってきて登録し、Member型で返す
 * @param guild Guildオブジェクト
 * @param userId ユーザーID
 * @returns Member型オブジェクト
 */
export async function searchDBMemberById(guild: Guild, userId: string): Promise<Member> {
    const members = await MembersService.getMemberByUserId(guild.id, userId);

    // membersテーブルにレコードがあるか確認
    if (members.length == 0) {
        const memberRaw: GuildMember = await searchAPIMemberById(guild, userId);

        if (memberRaw.joinedAt === null) {
            throw new Error('joinedAt is null');
        }

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
        const memberRaw: GuildMember = await searchAPIMemberById(guild, userId);

        if (memberRaw.joinedAt === null) {
            throw new Error('joinedAt is null');
        }

        const newMember = new Member(
            guild.id,
            userId,
            memberRaw.displayName,
            memberRaw.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
            memberRaw.joinedAt,
        );

        await MembersService.registerMember(newMember);

        return newMember;
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
