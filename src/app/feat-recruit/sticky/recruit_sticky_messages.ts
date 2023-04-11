import { Guild, Message, MessageCreateOptions, MessagePayload } from 'discord.js';
import { searchMessageById } from '../../common/manager/message_manager';
import { searchChannelById } from '../../common/manager/channel_manager';
import { StickyService } from '../../../db/sticky_service';
import { ParticipantService } from '../../../db/participants_service';
import { RecruitService } from '../../../db/recruit_service';
import { RecruitType } from '../../../db/model/recruit';
import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('message');

export async function stickyChannelCheck(message: Message) {
    try {
        const guild = await message.guild?.fetch();
        if (guild === undefined) {
            throw new Error('guild cannot fetch.');
        }
        const channelId = message.channelId;
        if (channelId === process.env.CHANNEL_ID_RECRUIT_PRIVATE) {
            const content = await availableRecruitString(guild, channelId, RecruitType.PrivateRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_ANARCHY) {
            const content = await availableRecruitString(guild, channelId, RecruitType.AnarchyRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_REGULAR) {
            const content = await availableRecruitString(guild, channelId, RecruitType.RegularRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_LEAGUE) {
            const content = await availableRecruitString(guild, channelId, RecruitType.LeagueRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_SALMON) {
            const content = await availableRecruitString(guild, channelId, RecruitType.SalmonRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_OTHERGAMES) {
            const content = await availableRecruitString(guild, channelId, RecruitType.OtherGameRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_SHIVER) {
            const content = await availableRecruitString(guild, channelId, RecruitType.FestivalRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_FRYE) {
            const content = await availableRecruitString(guild, channelId, RecruitType.FestivalRecruit);
            await sendStickyMessage(guild, channelId, content);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_BIGMAN) {
            const content = await availableRecruitString(guild, channelId, RecruitType.FestivalRecruit);
            await sendStickyMessage(guild, channelId, content);
        }
    } catch (error) {
        logger.error(error);
    }
}

export async function availableRecruitString(guild: Guild, channelId: string, recruitType: number) {
    let recruitData = await RecruitService.getRecruitsByRecruitType(guild.id, recruitType);

    // プラベ募集のときだけもう一種類取り直して結合
    if (recruitType === RecruitType.ButtonNotify) {
        recruitData = recruitData.concat(await RecruitService.getRecruitsByRecruitType(guild.id, RecruitType.PrivateRecruit));
    } else if (recruitType === RecruitType.PrivateRecruit) {
        recruitData = recruitData.concat(await RecruitService.getRecruitsByRecruitType(guild.id, RecruitType.ButtonNotify));
    }

    let result = '**現在開催中の募集一覧** `[' + recruitData.length + ']`';
    if (recruitData.length === 0) {
        result += '\n`現在このチャンネルで開催中の募集はありません。`';
    }
    for (const recruit of recruitData) {
        const participantsData = await ParticipantService.getAllParticipants(guild.id, recruit.messageId);
        const applicantList = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 2) {
                applicantList.push(participant);
            }
        }
        const message = await searchMessageById(guild, channelId, recruit.messageId);
        const recruiter = participantsData[0];
        if (message !== null && participantsData.length !== 0) {
            if (recruit.recruitNum !== -1) {
                result = result + `\n\`${recruiter.displayName}\`: ${message.url} \`[${applicantList.length}/${recruit.recruitNum}\`]`;
            } else {
                result = result + `\n\`${recruiter.displayName}\`: ${message.url} \`[${applicantList.length}\`]`;
            }
        }
    }
    return result;
}

export async function sendStickyMessage(guild: Guild, channelId: string, content: string | MessagePayload | MessageCreateOptions) {
    const lastStickyMsgId = await StickyService.getMessageId(guild.id, channelId);
    if (lastStickyMsgId.length !== 0) {
        const lastStickyMsg = await searchMessageById(guild, channelId, lastStickyMsgId[0]);
        if (lastStickyMsg !== null) {
            await lastStickyMsg.delete();
        }
    }
    const channel = await searchChannelById(guild, channelId);
    const stickyMessage = await channel.send(content);
    await StickyService.registerMessageId(guild.id, channelId, stickyMessage.id);
}
