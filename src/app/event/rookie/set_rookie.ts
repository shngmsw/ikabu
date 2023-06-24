import { FriendCode } from '@prisma/client';
import { GuildMember, Role } from 'discord.js';

import { FriendCodeService } from '../../../db/friend_code_service.js';
import { MemberService } from '../../../db/member_service.js';
import { MessageCountService } from '../../../db/message_count_service.js';
import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager.js';
import { searchRoleById } from '../../common/manager/role_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../common/others.js';

const logger = log4js_obj.getLogger('guildMemberAdd');

export async function guildMemberAddEvent(newMember: GuildMember) {
    try {
        const guild = await newMember.guild.fetch();
        if (guild.id != process.env.SERVER_ID) {
            return;
        }
        assertExistCheck(process.env.CHANNEL_ID_ROBBY, 'CHANNEL_ID_ROBBY');
        assertExistCheck(process.env.ROOKIE_ROLE_ID, 'ROOKIE_ROLE_ID');
        const lobbyChannel = await searchChannelById(guild, process.env.CHANNEL_ID_ROBBY);
        const beginnerRole = await searchRoleById(guild, process.env.ROOKIE_ROLE_ID);
        const userId = newMember.user.id;

        if (notExists(lobbyChannel) || !lobbyChannel.isTextBased()) {
            logger.error('lobby channel not found!');
            return;
        }

        const sentMessage = await lobbyChannel.send(
            `<@!${userId}> たん、よろしくお願いします！\n` +
                `最初の10分間は閲覧しかできません、その間に <#${process.env.CHANNEL_ID_RULE}> と <#${process.env.CHANNEL_ID_DESCRIPTION}> をよく読んでくださいね\n` +
                `10分経ったら、書き込めるようになります。 <#${process.env.CHANNEL_ID_INTRODUCTION}> で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                `${guild.name}のみんなが歓迎していますよ〜`,
        );

        if (!(beginnerRole instanceof Role)) {
            await lobbyChannel.send(
                '「新入部員ロールのIDが設定されていないでし！\n気付いた方はサポートセンターまでお問合わせお願いします。」とのことでし！',
            );
        } else {
            const messageCount = await getMessageCount(newMember.id);

            // membersテーブルにレコードがあるか確認
            if (notExists(await MemberService.getMemberByUserId(guild.id, userId))) {
                const friendCode = await FriendCodeService.getFriendCodeObjByUserId(newMember.id);
                await sleep(600);
                const memberCheck = await searchAPIMemberById(guild, userId);
                if (exists(memberCheck)) {
                    await setRookieRole(memberCheck, beginnerRole, messageCount, friendCode);
                }
                await sentMessage.react('👍');
            }
        }
    } catch (error) {
        logger.error(error);
    }
}

async function setRookieRole(member: GuildMember, beginnerRole: Role, messageCount: number, friendCode: FriendCode | null) {
    if (messageCount == 0 && exists(friendCode)) {
        if (member) {
            member.roles.add(beginnerRole).catch((error) => {
                logger.error(error);
            });
        }
    }
}

async function getMessageCount(userId: string) {
    const result = await MessageCountService.getMemberByUserId(userId);
    if (exists(result)) {
        return result.count;
    }
    return 0;
}
