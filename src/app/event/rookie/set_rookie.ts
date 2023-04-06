import { GuildMember, Role } from 'discord.js';
import { FriendCodeService } from '../../../db/friend_code_service.js';
import { MembersService } from '../../../db/members_service.js';
import { MessageCountService } from '../../../db/message_count_service.js';
import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { searchAPIMemberById } from '../../common/manager/member_manager';
import { searchRoleById } from '../../common/manager/role_manager';
import { sleep } from '../../common/others.js';
import { FriendCode } from '../../../db/model/friend_code.js';

const logger = log4js_obj.getLogger('guildMemberAdd');

export async function guildMemberAddEvent(newMember: GuildMember) {
    try {
        const guild = await newMember.guild.fetch();
        if (guild.id != process.env.SERVER_ID) {
            return;
        }
        const lobby_channel = await searchChannelById(guild, process.env.CHANNEL_ID_ROBBY);
        const beginnerRole = await searchRoleById(guild, process.env.ROOKIE_ROLE_ID);
        const userId = newMember.user.id;

        const sentMessage = await lobby_channel.send(
            `<@!${userId}> たん、よろしくお願いします！\n` +
                `最初の10分間は閲覧しかできません、その間に <#${process.env.CHANNEL_ID_RULE}> と <#${process.env.CHANNEL_ID_DESCRIPTION}> をよく読んでくださいね\n` +
                `10分経ったら、書き込めるようになります。 <#${process.env.CHANNEL_ID_INTRODUCTION}> で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                `${guild.name}のみんなが歓迎していますよ〜`,
        );

        if (!(beginnerRole instanceof Role)) {
            lobby_channel.send(
                '「新入部員ロールのIDが設定されていないでし！\n気付いた方はサポートセンターまでお問合わせお願いします。」とのことでし！',
            );
        } else {
            const messageCount = await getMessageCount(newMember.id);
            const member = await searchAPIMemberById(guild.id, userId);

            // membersテーブルにレコードがあるか確認
            if ((await MembersService.getMemberByUserId(guild.id, userId)).length == 0) {
                if (member.joinedAt === null) {
                    throw new Error('joinedAt is null');
                }
                MembersService.registerMember(
                    guild.id,
                    userId,
                    member.displayName,
                    member.displayAvatarURL({ extension: 'png' }),
                    member.joinedAt,
                );
                const friendCode = await FriendCodeService.getFriendCodeByUserId(newMember.id);
                await sleep(600);
                await setRookieRole(member, beginnerRole, messageCount, friendCode);
            } else {
                MembersService.updateProfile(guild.id, userId, member.displayName, member.displayAvatarURL({ extension: 'png' }));
            }
            await sentMessage.react('👍');
        }
    } catch (error) {
        logger.error(error);
    }
}

async function setRookieRole(member: GuildMember, beginnerRole: Role, messageCount: number, friendCode: FriendCode[]) {
    if (messageCount == 0 && friendCode.length == 0) {
        if (member) {
            member.roles.set([beginnerRole.id]).catch((error) => {
                logger.error(error);
            });
        }
    }
}

async function getMessageCount(id: string) {
    const result = await MessageCountService.getMemberByUserId(id);
    if (result[0] != null) {
        return result[0].count;
    }
    return 0;
}
