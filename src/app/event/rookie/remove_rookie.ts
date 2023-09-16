import Discord, { GuildMember, Message, Role } from 'discord.js';

import { sendIntentionConfirmReply } from './send_questionnaire';
import { RecruitCountService } from '../../../db/recruit_count_service';
import { UniqueRoleService } from '../../../db/unique_role_service';
import { VoiceCountService } from '../../../db/voice_count_service';
import { getAPIMemberByMessage } from '../../common/manager/member_manager';
import { unassignRoleFromMember } from '../../common/manager/role_manager';
import { exists, getDeveloperMention, notExists } from '../../common/others';
import { RoleKeySet } from '../../constant/role_key';

export async function removeRookie(msg: Message<true>) {
    const guild = msg.guild;
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

    if (await isRemoveRookie(member)) {
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

/*
 * 新入部員かどうかを判定する
 * voice_countテーブルのtotal_secが20時間以上
 * かつ recruit_countテーブルのrecruit_count + join_countが20回以上
 * の場合
 * @param member
 * @return boolean
 */
async function isRemoveRookie(member: GuildMember) {
    const recruitCountResult: {
        userId: string;
        recruitCount: number;
        joinCount: number;
    } | null = await RecruitCountService.getCountByUserId(member.id);
    if (recruitCountResult === null) {
        return false;
    }
    const count = recruitCountResult?.recruitCount + recruitCountResult?.joinCount;
    const voiceCountResult: { userId: string; totalSec: number } | null =
        await VoiceCountService.getCountByUserId(member.id);
    if (voiceCountResult === null) {
        return false;
    }
    const totalSec = voiceCountResult.totalSec;
    if (count >= 20 && totalSec >= 72000) {
        return true;
    } else {
        return false;
    }
}
