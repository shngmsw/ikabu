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
        let content: string;
        if (channelId === process.env.CHANNEL_ID_RECRUIT_PRIVATE) {
            content = await availableRecruitString(guild, channelId, RecruitType.PrivateRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_ANARCHY) {
            content = await availableRecruitString(guild, channelId, RecruitType.AnarchyRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_REGULAR) {
            content = await availableRecruitString(guild, channelId, RecruitType.RegularRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_LEAGUE) {
            content = await availableRecruitString(guild, channelId, RecruitType.LeagueRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_SALMON) {
            content = await availableRecruitString(guild, channelId, RecruitType.SalmonRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_OTHERGAMES) {
            content = await availableRecruitString(guild, channelId, RecruitType.OtherGameRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_SHIVER) {
            content = await availableRecruitString(guild, channelId, RecruitType.FestivalRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_FRYE) {
            content = await availableRecruitString(guild, channelId, RecruitType.FestivalRecruit);
        } else if (channelId === process.env.CHANNEL_ID_RECRUIT_BIGMAN) {
            content = await availableRecruitString(guild, channelId, RecruitType.FestivalRecruit);
        } else {
            return;
        }

        await sendStickyMessage(guild, channelId, content);
    } catch (error) {
        logger.error(error);
    }
}

export async function availableRecruitString(guild: Guild, channelId: string, recruitType: number) {
    let recruitData = await RecruitService.getRecruitsByRecruitType(guild.id, recruitType);

    // プラベ募集のときだけもう一種類取り直して結合
    if (recruitType === RecruitType.ButtonNotify) {
        const privateRecruitData = await RecruitService.getRecruitsByRecruitType(guild.id, RecruitType.PrivateRecruit);
        recruitData = recruitData.concat(privateRecruitData);
    } else if (recruitType === RecruitType.PrivateRecruit) {
        const buttonRecruitData = await RecruitService.getRecruitsByRecruitType(guild.id, RecruitType.PrivateRecruit);
        recruitData = recruitData.concat(buttonRecruitData);
    }

    let result = '**現在参加受付中の募集一覧** `[' + recruitData.length + ']`';
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
