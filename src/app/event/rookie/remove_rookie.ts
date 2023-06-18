import Discord, { Message } from 'discord.js';

import { sendIntentionConfirmReply } from './send_questionnaire';
import { MessageCountService } from '../../../db/message_count_service.js';
import { getAPIMemberByMessage } from '../../common/manager/member_manager';
import { searchRoleById } from '../../common/manager/role_manager';
import { assertExistCheck, exists } from '../../common/others';

export async function removeRookie(msg: Message<true>) {
    const dt = new Date();
    const guild = msg.guild;
    const lastMonth = dt.setMonth(dt.getMonth() - 1);
    const authorId = msg.author.id;
    const member = await getAPIMemberByMessage(msg);
    assertExistCheck(process.env.ROOKIE_ROLE_ID, 'process.env.ROOKIE_ROLE_ID');
    const beginnerRoleId = process.env.ROOKIE_ROLE_ID;
    const messageCount = await getMessageCount(authorId);
    if ((exists(member.joinedTimestamp) && member.joinedTimestamp < lastMonth) || messageCount > 99) {
        const hasBeginnerRole = await searchRoleById(guild, beginnerRoleId);
        if (hasBeginnerRole) {
            await member.roles.remove([beginnerRoleId]);
            const embed = new Discord.EmbedBuilder();
            embed.setDescription('新入部員期間が終わったでし！\nこれからもイカ部心得を守ってイカ部生活をエンジョイするでし！');
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

async function getMessageCount(id: string) {
    const result = await MessageCountService.getMemberByUserId(id);
    if (exists(result[0])) {
        return result[0].count;
    }
    return 0;
}
