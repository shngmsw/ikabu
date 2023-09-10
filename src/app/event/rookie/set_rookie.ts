import { FriendCode } from '@prisma/client';
import { GuildMember, Role } from 'discord.js';

import { FriendCodeService } from '../../../db/friend_code_service.js';
import { MemberService } from '../../../db/member_service.js';
import { MessageCountService } from '../../../db/message_count_service.js';
import { UniqueChannelService } from '../../../db/unique_channel_service.js';
import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager.js';
import { assignRoleToMember, searchRoleById } from '../../common/manager/role_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../common/others.js';
import { ChannelKeySet } from '../../constant/channel_key.js';
import { sendErrorLogs } from '../../logs/error/send_error_logs.js';

const logger = log4js_obj.getLogger('guildMemberAdd');

export async function guildMemberAddEvent(newMember: GuildMember) {
    try {
        const guild = await newMember.guild.fetch();
        const userId = newMember.user.id;

        if (guild.id != process.env.SERVER_ID) {
            return;
        }

        const lobbyChannelId = await UniqueChannelService.getChannelIdByKey(
            guild.id,
            ChannelKeySet.Lobby.key,
        );
        let lobbyChannel = null;
        let welcomeMessage = null;
        if (exists(lobbyChannelId)) {
            lobbyChannel = await searchChannelById(guild, lobbyChannelId);
        }
        // ロビーチャンネルが設定されているサーバーでは、ロビーチャンネルにメッセージを送信する
        if (exists(lobbyChannel) && lobbyChannel.isTextBased()) {
            const ruleChannelId = await UniqueChannelService.getChannelIdByKey(
                guild.id,
                ChannelKeySet.Rule.key,
            );
            const descriptionChannelId = await UniqueChannelService.getChannelIdByKey(
                guild.id,
                ChannelKeySet.Description.key,
            );
            const introductionChannelId = await UniqueChannelService.getChannelIdByKey(
                guild.id,
                ChannelKeySet.Introduction.key,
            );

            welcomeMessage = await lobbyChannel.send(
                `<@!${userId}> たん、よろしくお願いします！\n` +
                    `最初の10分間は閲覧しかできません、その間に <#${ruleChannelId}> と <#${descriptionChannelId}> をよく読んでくださいね\n` +
                    `10分経ったら、書き込めるようになります。 <#${introductionChannelId}> で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                    `${guild.name}のみんなが歓迎していますよ〜`,
            );
        }

        assertExistCheck(process.env.ROOKIE_ROLE_ID, 'ROOKIE_ROLE_ID');
        const beginnerRole = await searchRoleById(guild, process.env.ROOKIE_ROLE_ID);

        // 新入部員ロールが設定されているサーバーでは、新入部員ロールを付与する
        if (exists(beginnerRole)) {
            const messageCount = await getMessageCount(newMember.id);

            // membersテーブルにレコードがあるか確認
            if (notExists(await MemberService.getMemberByUserId(guild.id, userId))) {
                const friendCode = await FriendCodeService.getFriendCodeObjByUserId(newMember.id);
                await sleep(600);
                const memberCheck = await searchAPIMemberById(guild, userId);
                if (exists(memberCheck)) {
                    await setRookieRole(memberCheck, beginnerRole, messageCount, friendCode);
                }
                if (exists(welcomeMessage)) {
                    await welcomeMessage.react('👍');
                }
            }
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}

async function setRookieRole(
    member: GuildMember,
    beginnerRole: Role,
    messageCount: number,
    friendCode: FriendCode | null,
) {
    if (messageCount === 0 && notExists(friendCode)) {
        if (member) {
            await assignRoleToMember(beginnerRole, member);
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
