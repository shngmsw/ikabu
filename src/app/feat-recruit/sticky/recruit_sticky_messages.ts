import { Channel, Guild, Message } from 'discord.js';

import { Recruit, RecruitType } from '../../../db/model/recruit';
import { ParticipantService } from '../../../db/participants_service';
import { RecruitService } from '../../../db/recruit_service';
import { log4js_obj } from '../../../log4js_settings';
import { searchMessageById } from '../../common/manager/message_manager';
import { RequireOne, assertExistCheck, exists, getCommandHelpEmbed } from '../../common/others';
import { sendStickyMessage } from '../../common/sticky_message';
import { createNewRecruitButton } from '../buttons/create_recruit_buttons';

const logger = log4js_obj.getLogger('message');

export type StickyOptions = RequireOne<{
    message?: Message<true>;
    channelOpt?: {
        guild: Guild;
        channelId: string;
    };
}>;

/**
 * 募集用のSticky Messageを送信する
 * @param {StickyOptions} stickyOptions StickyOptions
 */
export async function sendRecruitSticky(stickyOptions: StickyOptions) {
    try {
        let guild: Guild;
        let channelId: string;
        if (exists(stickyOptions.message)) {
            guild = await stickyOptions.message.guild.fetch();
            channelId = stickyOptions.message.channelId;
        } else if (exists(stickyOptions.channelOpt)) {
            guild = stickyOptions.channelOpt.guild;
            channelId = stickyOptions.channelOpt.channelId;
        } else {
            throw new Error('Invalid sticky options');
        }

        let content: string;
        if (channelId === process.env.CHANNEL_ID_RECRUIT_PRIVATE) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_ANARCHY) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_REGULAR) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_EVENT) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_SALMON) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_OTHERGAMES) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_SHIVER) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_FRYE) {
            content = await availableRecruitString(guild, channelId);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_BIGMAN) {
            content = await availableRecruitString(guild, channelId);
        } else {
            return;
        }

        await sendStickyMessage(guild, channelId, content);
    } catch (error) {
        logger.error(error);
    }
}

export async function sendCloseEmbedSticky(guild: Guild, channel: Channel) {
    if (channel.isTextBased() && !channel.isDMBased() && !channel.isThread() && !channel.isVoiceBased()) {
        const content = await availableRecruitString(guild, channel.id);
        const helpEmbed = getCommandHelpEmbed(channel.name);
        await sendStickyMessage(guild, channel.id, {
            content: content,
            embeds: [helpEmbed],
            components: [createNewRecruitButton(channel.name)],
        });
    }
}

export async function availableRecruitString(guild: Guild, channelId: string) {
    let recruitData = await RecruitService.getRecruitsByChannelId(guild.id, channelId);

    if (channelId === process.env.CHANNEL_ID_RECRUIT_PRIVATE) {
        // チャンネルIDがプラベ募集チャンネルの場合は、フォーラムでのコマンド募集も含める
        recruitData = await RecruitService.getRecruitsByRecruitType(guild.id, RecruitType.PrivateRecruit);
    } else if (channelId === process.env.CHANNEL_ID_RECRUIT_OTHERGAMES) {
        // チャンネルIDが別ゲー募集チャンネルの場合は、フォーラムでの別ゲー募集も含める
        recruitData = await RecruitService.getRecruitsByRecruitType(guild.id, RecruitType.OtherGameRecruit);
    }

    recruitData.sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime()); // 作成順でソート

    let recruits = '';
    let count = 0; // 募集数カウンタ
    for (const recruit of recruitData) {
        const participantsData = await ParticipantService.getAllParticipants(guild.id, recruit.messageId);
        const applicantList = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 2) {
                applicantList.push(participant);
            }
        }
        const message = await searchMessageById(guild, recruit.channelId, recruit.messageId);
        const recruiter = participantsData[0];
        if (exists(message) && participantsData.length !== 0) {
            // 別チャンネルで同じタイプの募集をしているときmessage = nullになる
            if (recruit.recruitNum !== -1) {
                recruits = recruits + `\n\`${recruiter.displayName}\`: ${message.url} \`[${applicantList.length}/${recruit.recruitNum}\`]`;
            } else {
                recruits = recruits + `\n\`${recruiter.displayName}\`: ${message.url} \`[${applicantList.length}\`]`;
            }
            count++;
        } else {
            await RecruitService.deleteRecruit(guild.id, recruit.messageId);
            logger.warn(`recruit message is not found. record deleted. \n[guildId: ${guild.id}, messageId: ${recruit.messageId}]`);
        }
    }

    let result = '**現在参加受付中の募集一覧** `[' + count + ']`';
    if (count === 0) {
        result += '\n`現在このチャンネルで参加受付中の募集はありません。`';
    } else {
        result += recruits;
    }

    return result;
}

export function getStickyChannelId(recruit: Recruit) {
    assertExistCheck(process.env.CHANNEL_ID_RECRUIT_PRIVATE, 'CHANNEL_ID_RECRUIT_PRIVATE');
    assertExistCheck(process.env.CHANNEL_ID_RECRUIT_OTHERGAMES, 'CHANNEL_ID_RECRUIT_OTHERGAMES');
    if (recruit.recruitType === RecruitType.PrivateRecruit) {
        return process.env.CHANNEL_ID_RECRUIT_PRIVATE;
    } else if (recruit.recruitType === RecruitType.OtherGameRecruit) {
        return process.env.CHANNEL_ID_RECRUIT_OTHERGAMES;
    }
}
