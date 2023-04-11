import { AttachmentBuilder, Guild, Message } from 'discord.js';
import { Participant } from '../../../db/model/participant';
import { Recruit, RecruitType } from '../../../db/model/recruit';
import { ParticipantService } from '../../../db/participants_service';
import { RecruitService } from '../../../db/recruit_service';
import { searchMessageById } from '../../common/manager/message_manager';
import { recruitAnarchyCanvas } from './anarchy_canvas';
import { recruitSalmonCanvas } from './salmon_canvas';
import { recruitRegularCanvas } from './regular_canvas';
import { log4js_obj } from '../../../log4js_settings';

const logger = log4js_obj.getLogger('recruit');

export const RecruitOpCode = {
    open: 0,
    close: 1,
    cancel: 2,
};

export async function regenerateCanvas(guild: Guild, channelId: string, messageId: string, opCode: number) {
    try {
        const recruitData = await RecruitService.getRecruit(messageId);
        if (recruitData.length === 0) {
            logger.warn('canvas was not regenerated! [recruitData was not found!]');
            return;
        }
        const participantsData = await ParticipantService.getAllParticipants(guild.id, messageId);
        const message = await searchMessageById(guild, channelId, messageId);
        const applicantList = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 2) {
                applicantList.push(participant);
            }
        }
        const applicantNum = applicantList.length;
        switch (recruitData[0].recruitType) {
            case RecruitType.RegularRecruit:
                regenRegularCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
                break;
            case RecruitType.AnarchyRecruit:
                regenAnarchyCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
                break;
            case RecruitType.SalmonRecruit:
                regenSalmonCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
        }
    } catch (error) {
        logger.error(error);
    }
}

async function regenRegularCanvas(
    message: Message,
    recruitData: Recruit,
    participantsData: Participant[],
    applicantNum: number,
    opCode: number,
) {
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.channelName;
    const condition = recruitData.condition;

    const submitMembersList = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach((participant, index) => (submitMembersList[index] = participant));

    const recruitBuffer = await recruitRegularCanvas(
        opCode,
        remainingNum,
        count,
        submitMembersList[0],
        submitMembersList[1],
        submitMembersList[2],
        submitMembersList[3],
        submitMembersList[4],
        submitMembersList[5],
        submitMembersList[6],
        submitMembersList[7],
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    message.edit({ files: [recruit] });
}

async function regenAnarchyCanvas(
    message: Message,
    recruitData: Recruit,
    participantsData: Participant[],
    applicantNum: number,
    opCode: number,
) {
    const applicantList = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.channelName;
    const condition = recruitData.condition;
    const rank = recruitData.option;

    const submitMembersList = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach((participant, index) => (submitMembersList[index] = participant));

    const recruitBuffer = await recruitAnarchyCanvas(
        opCode,
        remainingNum,
        count,
        submitMembersList[0],
        submitMembersList[1],
        submitMembersList[2],
        submitMembersList[3],
        condition,
        rank,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    message.edit({ files: [recruit] });
}

async function regenSalmonCanvas(
    message: Message,
    recruitData: Recruit,
    participantsData: Participant[],
    applicantNum: number,
    opCode: number,
) {
    const applicantList = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.channelName;
    const condition = recruitData.condition;

    const submitMembersList = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach((participant, index) => (submitMembersList[index] = participant));

    const recruitBuffer = await recruitSalmonCanvas(
        opCode,
        remainingNum,
        count,
        submitMembersList[0],
        submitMembersList[1],
        submitMembersList[2],
        submitMembersList[3],
        condition,
        channelName,
    );

    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    message.edit({ files: [recruit] });
}
