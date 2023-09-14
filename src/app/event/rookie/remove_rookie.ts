import Discord, { Message, Role } from 'discord.js';

import { sendIntentionConfirmReply } from './send_questionnaire';
import { MessageCountService } from '../../../db/message_count_service.js';
import { UniqueRoleService } from '../../../db/unique_role_service';
import { getAPIMemberByMessage } from '../../common/manager/member_manager';
import { unassignRoleFromMember } from '../../common/manager/role_manager';
import { exists, getDeveloperMention, notExists } from '../../common/others';
import { RoleKeySet } from '../../constant/role_key';

export async function removeRookie(msg: Message<true>) {
    const dt = new Date();
    const guild = msg.guild;
    const lastMonth = dt.setMonth(dt.getMonth() - 1);
    const authorId = msg.author.id;
    const member = await getAPIMemberByMessage(msg);
    const rookieRoleId = await UniqueRoleService.getRoleIdByKey(guild.id, RoleKeySet.Rookie.key);

    if (notExists(rookieRoleId)) {
        if (guild.id === process.env.SERVER_ID) {
            await msg.channel.send(
                (await getDeveloperMention(guild.id)) + '新入部員ロールが設定されていないでし！',
            );
        }
        return;
    }

    const messageCount = await getMessageCount(authorId);
    if (
        (exists(member.joinedTimestamp) && member.joinedTimestamp < lastMonth) ||
        messageCount > 99
    ) {
        const hasRookieRole = member.roles.cache.find((role: Role) => role.id === rookieRoleId);
        if (hasRookieRole) {
            await unassignRoleFromMember(rookieRoleId, member);
            const embed = new Discord.EmbedBuilder();
            embed.setDescription(
                '新入部員期間が終わったでし！\nこれからもイカ部心得を守ってイカ部生活をエンジョイするでし！',
            );
            embed.setAuthor({
                name: member.displayName,
                iconURL: member.displayAvatarURL(),
            });
            await msg.channel.send({ embeds: [embed] }).catch();
            if (exists(process.env.QUESTIONNAIRE_ROOKIE_URL)) {
                await sendIntentionConfirmReply(msg, authorId, 'QUESTIONNAIRE_ROOKIE_URL');
            }
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
