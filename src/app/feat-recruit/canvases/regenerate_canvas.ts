import { Member, Recruit } from '@prisma/client';
import { AttachmentBuilder, Guild, Message } from 'discord.js';

import { recruitAnarchyCanvas } from './anarchy_canvas';
import { recruitBigRunCanvas } from './big_run_canvas';
import { recruitEventCanvas } from './event_canvas';
import { recruitFesCanvas } from './fes_canvas';
import { recruitRegularCanvas } from './regular_canvas';
import { recruitSalmonCanvas } from './salmon_canvas';
import { ParticipantService, ParticipantMember } from '../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../db/recruit_service';
import { log4js_obj } from '../../../log4js_settings';
import { searchMessageById } from '../../common/manager/message_manager';
import { searchRoleById, searchRoleIdByName } from '../../common/manager/role_manager';
import { assertExistCheck, notExists } from '../../common/others';
import { sendErrorLogs } from '../../logs/error/send_error_logs';

const logger = log4js_obj.getLogger('recruit');

export const RecruitOpCode = {
    open: 0,
    close: 1,
    cancel: 2,
};

export async function regenerateCanvas(
    guild: Guild,
    channelId: string,
    messageId: string,
    opCode: number,
) {
    try {
        const recruitData = await RecruitService.getRecruit(guild.id, messageId);
        if (notExists(recruitData)) {
            logger.warn('canvas was not regenerated! [recruitData was not found!]');
            return;
        }
        const participantsData = await ParticipantService.getAllParticipants(guild.id, messageId);
        const message = await searchMessageById(guild, channelId, messageId);
        assertExistCheck(message, 'message');
        const applicantList: ParticipantMember[] = []; // 参加希望者リスト
        for (const participant of participantsData) {
            if (participant.userType === 2) {
                applicantList.push(participant);
            }
        }
        const applicantNum = applicantList.length;
        switch (recruitData.recruitType) {
            case RecruitType.RegularRecruit:
                await regenRegularCanvas(
                    message,
                    recruitData,
                    participantsData,
                    applicantNum,
                    opCode,
                );
                break;
            case RecruitType.EventRecruit:
                await regenEventCanvas(
                    message,
                    recruitData,
                    participantsData,
                    applicantNum,
                    opCode,
                );
                break;
            case RecruitType.AnarchyRecruit:
                await regenAnarchyCanvas(
                    message,
                    recruitData,
                    participantsData,
                    applicantNum,
                    opCode,
                );
                break;
            case RecruitType.SalmonRecruit:
                await regenSalmonCanvas(
                    message,
                    recruitData,
                    participantsData,
                    applicantNum,
                    opCode,
                    false,
                );
                break;
            case RecruitType.FestivalRecruit:
                await regenFesCanvas(message, recruitData, participantsData, applicantNum, opCode);
                break;
            case RecruitType.BigRunRecruit:
                await regenBigRunCanvas(
                    message,
                    recruitData,
                    participantsData,
                    applicantNum,
                    opCode,
                );
                break;
            case RecruitType.TeamContestRecruit:
                await regenSalmonCanvas(
                    message,
                    recruitData,
                    participantsData,
                    applicantNum,
                    opCode,
                    true,
                );
                break;
        }
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}

async function regenRegularCanvas(
    message: Message<true>,
    recruitData: Recruit,
    participantsData: ParticipantMember[],
    applicantNum: number,
    opCode: number,
) {
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.vcName;
    const condition = recruitData.condition;

    const submitMembersList: (Member | null)[] = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach(
        (participant, index) => (submitMembersList[index] = participant.member),
    );

    if (notExists(submitMembersList[0])) return;

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

    await message.edit({ files: [recruit] });
}

async function regenEventCanvas(
    message: Message<true>,
    recruitData: Recruit,
    participantsData: ParticipantMember[],
    applicantNum: number,
    opCode: number,
) {
    const applicantList: ParticipantMember[] = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.vcName;
    const condition = recruitData.condition;

    const submitMembersList: (Member | null)[] = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach(
        (participant, index) => (submitMembersList[index] = participant.member),
    );

    if (notExists(submitMembersList[0])) return;

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

    await message.edit({ files: [recruit] });
}

async function regenAnarchyCanvas(
    message: Message<true>,
    recruitData: Recruit,
    participantsData: ParticipantMember[],
    applicantNum: number,
    opCode: number,
) {
    const applicantList: ParticipantMember[] = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.vcName;
    const condition = recruitData.condition;
    const rank = recruitData.option;

    const submitMembersList: (Member | null)[] = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach(
        (participant, index) => (submitMembersList[index] = participant.member),
    );

    if (notExists(submitMembersList[0])) return;

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

    await message.edit({ files: [recruit] });
}

async function regenSalmonCanvas(
    message: Message<true>,
    recruitData: Recruit,
    participantsData: ParticipantMember[],
    applicantNum: number,
    opCode: number,
    isTeamContest: boolean,
) {
    const applicantList: ParticipantMember[] = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.vcName;
    const condition = recruitData.condition;

    const submitMembersList: (Member | null)[] = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach(
        (participant, index) => (submitMembersList[index] = participant.member),
    );

    if (notExists(submitMembersList[0])) return;

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

    await message.edit({ files: [recruit] });
}

async function regenFesCanvas(
    message: Message<true>,
    recruitData: Recruit,
    participantsData: ParticipantMember[],
    applicantNum: number,
    opCode: number,
) {
    const applicantList: ParticipantMember[] = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.vcName;
    const condition = recruitData.condition;
    const teamName = recruitData.option;
    assertExistCheck(teamName, 'teamName');

    const mentionId = await searchRoleIdByName(message.guild, teamName);
    assertExistCheck(mentionId);
    const teamRole = await searchRoleById(message.guild, mentionId);
    assertExistCheck(teamRole, 'teamRole');

    const submitMembersList: (Member | null)[] = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach(
        (participant, index) => (submitMembersList[index] = participant.member),
    );

    if (notExists(submitMembersList[0])) return;

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

    await message.edit({ files: [recruit] });
}
async function regenBigRunCanvas(
    message: Message<true>,
    recruitData: Recruit,
    participantsData: ParticipantMember[],
    applicantNum: number,
    opCode: number,
) {
    const applicantList: ParticipantMember[] = []; // 参加希望者リスト
    for (const participant of participantsData) {
        if (participant.userType === 2) {
            applicantList.push(participant);
        }
    }
    const recruitNum = recruitData.recruitNum;
    const remainingNum = recruitNum - applicantNum;
    const count = remainingNum + participantsData.length; // 全体の枠数
    const channelName = recruitData.vcName;
    const condition = recruitData.condition;

    const submitMembersList: (Member | null)[] = Array(count).fill(null); // 枠数までnull埋め
    participantsData.forEach(
        (participant, index) => (submitMembersList[index] = participant.member),
    );

    if (notExists(submitMembersList[0])) return;

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

    await message.edit({ files: [recruit] });
}
