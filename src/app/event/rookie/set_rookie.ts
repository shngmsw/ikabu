import { FriendCodeService } from '../../../db/friend_code_service.js';
import { MembersService } from '../../../db/members_service.js';
import { log4js_obj } from '../../../log4js_settings';
import { searchChannelById } from '../../common/manager/channel_manager';
import { searchMemberById } from '../../common/manager/member_manager';
import { searchRoleById } from '../../common/manager/role_manager';
import { isEmpty, sleep } from '../../common/others.js';

const logger = log4js_obj.getLogger('guildMemberAdd');

export async function guildMemberAddEvent(member: $TSFixMe) {
    try {
        const guild = await member.guild.fetch();
        if (guild.id != process.env.SERVER_ID) {
            return;
        }
        const lobby_channel = await searchChannelById(guild, process.env.CHANNEL_ID_ROBBY);
        const beginnerRole = await searchRoleById(guild, process.env.ROOKIE_ROLE_ID);

        const sentMessage = await lobby_channel.send(
            `<@!${member.user.id}> たん、よろしくお願いします！\n` +
                `最初の10分間は閲覧しかできません、その間に <#${process.env.CHANNEL_ID_RULE}> と <#${process.env.CHANNEL_ID_DESCRIPTION}> をよく読んでくださいね\n` +
                `10分経ったら、書き込めるようになります。 <#${process.env.CHANNEL_ID_INTRODUCTION}> で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                `${guild.name}のみんなが歓迎していますよ〜`,
        );

        if (isEmpty(beginnerRole)) {
            lobby_channel.send(
                '「新入部員ロールのIDが設定されていないでし！\n気付いた方はサポートセンターまでお問合わせお願いします。」とのことでし！',
            );
        } else {
            const messageCount = await getMessageCount(member.id);
            const friendCode = await FriendCodeService.getFriendCodeByUserId(member.id);
            await sleep(600);
            await setRookieRole(guild, member, beginnerRole, messageCount, friendCode);
            await sentMessage.react('👍');
        }
    } catch (error) {
        logger.error(error);
    }
}

async function setRookieRole(guild: $TSFixMe, member: $TSFixMe, beginnerRole: $TSFixMe, messageCount: $TSFixMe, friendCode: $TSFixMe) {
    if (messageCount == 0 && friendCode.length == 0) {
        const fetch_member = await searchMemberById(guild, member.id);
        if (fetch_member) {
            fetch_member.roles.add(beginnerRole).catch((error: $TSFixMe) => {
                logger.error(error);
            });
        }
    }
}

async function getMessageCount(id: $TSFixMe) {
    const result = await MembersService.getMemberByUserId(id);
    if (result[0] != null) {
        return result[0].message_count;
    }
    return 0;
}
