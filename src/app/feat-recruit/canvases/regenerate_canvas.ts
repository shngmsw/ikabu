import { AttachmentBuilder, Guild, Message } from 'discord.js';

import { recruitAnarchyCanvas } from './anarchy_canvas';
import { recruitBigRunCanvas } from './big_run_canvas';
import { recruitEventCanvas } from './event_canvas';
import { recruitFesCanvas } from './fes_canvas';
import { recruitRegularCanvas } from './regular_canvas';
import { recruitSalmonCanvas } from './salmon_canvas';
import { Participant } from '../../../db/model/participant';
import { Recruit, RecruitType } from '../../../db/model/recruit';
import { ParticipantService } from '../../../db/participants_service';
import { RecruitService } from '../../../db/recruit_service';
import { log4js_obj } from '../../../log4js_settings';
import { searchMessageById } from '../../common/manager/message_manager';
import { searchRoleById, searchRoleIdByName } from '../../common/manager/role_manager';
import { assertExistCheck } from '../../common/others';

const logger = log4js_obj.getLogger('recruit');

export const RecruitOpCode = {
    open: 0,
    close: 1,
    cancel: 2,
};

export async function regenerateCanvas(guild: Guild, channelId: string, messageId: string, opCode: number) {
    try {
        const recruitData = await RecruitService.getRecruit(guild.id, messageId);
        if (recruitData.length === 0) {
            logger.warn('canvas was not regenerated! [recruitData was not found!]');
            return;
        }
        const participantsData = await ParticipantService.getAllParticipants(guild.id, messageId);
        const message = await searchMessageById(guild, channelId, messageId);
        assertExistCheck(message, 'message');
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
            case RecruitType.EventRecruit:
                regenEventCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
                break;
            case RecruitType.AnarchyRecruit:
                regenAnarchyCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
                break;
            case RecruitType.SalmonRecruit:
                regenSalmonCanvas(message, recruitData[0], participantsData, applicantNum, opCode, false);
                break;
            case RecruitType.FestivalRecruit:
                regenFesCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
                break;
            case RecruitType.BigRunRecruit:
                regenBigRunCanvas(message, recruitData[0], participantsData, applicantNum, opCode);
                break;
            case RecruitType.TeamContestRecruit:
                regenSalmonCanvas(message, recruitData[0], participantsData, applicantNum, opCode, true);
                break;
        }
    } catch (error) {
        logger.error(error);
    }
}

async function regenRegularCanvas(
    message: Message<true>,
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

async function regenEventCanvas(
    message: Message<true>,
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

    const recruitBuffer = await recruitEventCanvas(
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

async function regenAnarchyCanvas(
    message: Message<true>,
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
    message: Message<true>,
    recruitData: Recruit,
    participantsData: Participant[],
    applicantNum: number,
    opCode: number,
    isTeamContest: boolean,
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
        isTeamContest ? 'コンテスト' : undefined,
    );

    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    message.edit({ files: [recruit] });
}

async function regenFesCanvas(
    message: Message<true>,
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
    const teamName = recruitData.option;
    assertExistCheck(teamName, 'teamName');

    const mentionId = await searchRoleIdByName(message.guild, teamName);
    assertExistCheck(mentionId);
    const teamRole = await searchRoleById(message.guild, mentionId);
    assertExistCheck(teamRole, 'teamRole');

    const submitMembersList = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach((participant, index) => (submitMembersList[index] = participant));

    const recruitBuffer = await recruitFesCanvas(
        opCode,
        remainingNum,
        count,
        submitMembersList[0],
        submitMembersList[1],
        submitMembersList[2],
        submitMembersList[3],
        teamRole.name,
        teamRole.hexColor,
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    message.edit({ files: [recruit] });
}
async function regenBigRunCanvas(
    message: Message<true>,
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

    const recruitBuffer = await recruitBigRunCanvas(
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
