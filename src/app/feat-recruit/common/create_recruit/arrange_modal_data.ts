import { Member } from '@prisma/client';
import {
    Guild,
    GuildMember,
    GuildTextBasedChannel,
    ModalSubmitInteraction,
    VoiceBasedChannel,
} from 'discord.js';

import { RecruitType } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { getSchedule } from '../../../common/apis/splatoon3.ink/splatoon3_ink';
import { Sp3Schedule } from '../../../common/apis/splatoon3.ink/types/schedule';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchAPIMemberById, searchDBMemberById } from '../../../common/manager/member_manager';
import {
    assertExistCheck,
    exists,
    getDeveloperMention,
    isEmpty,
    notExists,
} from '../../../common/others';
import { ErrorTexts } from '../../../constant/error_texts';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import { RecruitAlertTexts } from '../../alert_texts/alert_texts';
import {
    checkRecruitNum,
    checkRegularRecruitNum,
} from '../../common/condition_checks/recruit_num_check';
import { checkRecruitSchedule } from '../../common/condition_checks/schedule_check';
const logger = log4js_obj.getLogger('recruit');

export type RecruitData = {
    guild: Guild;
    interactionMember: GuildMember;
    recruitChannel: GuildTextBasedChannel;
    scheduleNum: number;
    txt: string;
    recruitNum: number;
    condition: string;
    count: number;
    recruiter: Member;
    attendee1: Member | null;
    attendee2: Member | null;
    attendee3: Member | null;
    schedule: Sp3Schedule;
    voiceChannel: VoiceBasedChannel | null;
};

export class RecruitConditionError extends Error {
    private errorMessage: string | undefined;
    constructor(errorMessage?: string) {
        super();
        this.errorMessage = errorMessage;
    }

    public getErrorMessage() {
        return this.errorMessage ?? ErrorTexts.UndefinedError;
    }
}

export async function arrangeModalRecruitData(
    interaction: ModalSubmitInteraction<'cached' | 'raw'>,
    recruitName: string,
    recruitType: RecruitType,
): Promise<RecruitData> {
    const guild = await getGuildByInteraction(interaction);
    const interactionMember = await searchAPIMemberById(guild, interaction.member.user.id);
    const recruitChannel = interaction.channel;
    assertExistCheck(interactionMember, 'GuildMember');
    assertExistCheck(recruitChannel, 'interaction.channel');
    const scheduleNum = 0;

    try {
        const schedule = await getSchedule();
        if (notExists(schedule)) {
            throw new RecruitConditionError(
                getDeveloperMention(guild.id) + RecruitAlertTexts.ScheduleLoadError,
            );
        }

        const checkScheduleResponse = await checkRecruitSchedule(
            guild.id,
            schedule,
            scheduleNum,
            recruitType,
        ); // 対象の日時に募集を建てられるかチェック
        if (!checkScheduleResponse.canRecruit) {
            throw new RecruitConditionError(checkScheduleResponse.recruitDateErrorMessage);
        }

        const voiceChannel = null;
        const recruitNum = Number(interaction.fields.getTextInputValue('rNum'));
        let condition = interaction.fields.getTextInputValue('condition');
        if (isEmpty(condition)) condition = 'なし';

        const recruiter = await searchDBMemberById(guild, interactionMember.id);
        assertExistCheck(recruiter, 'Member');

        const attendee1 = null;
        const attendee2 = null;
        const attendee3 = null;

        let recruitNumCheckResponse;
        if (recruitType === RecruitType.RegularRecruit) {
            recruitNumCheckResponse = checkRegularRecruitNum(
                recruitNum,
                attendee1,
                attendee2,
                attendee3,
            );
        } else {
            recruitNumCheckResponse = checkRecruitNum(recruitNum, attendee1, attendee2);
        }

        if (exists(recruitNumCheckResponse.recruitNumErrorMessage)) {
            throw new RecruitConditionError(recruitNumCheckResponse.recruitNumErrorMessage);
        }

        let txt = `### ${recruiter.mention}たんの${recruitName}\n`;
        txt += 'よければ合流しませんか？';

        return {
            guild: guild,
            interactionMember: interactionMember,
            recruitChannel: recruitChannel,
            scheduleNum: scheduleNum,
            txt: txt,
            recruitNum: recruitNum,
            condition: condition,
            count: recruitNumCheckResponse.memberCount,
            recruiter: recruiter,
            attendee1: attendee1,
            attendee2: attendee2,
            attendee3: attendee3,
            schedule: schedule,
            voiceChannel: voiceChannel,
        };
    } catch (error) {
        if (error instanceof RecruitConditionError) {
            // 募集条件のチェックを行う
            await interaction.deleteReply();
            await interaction.followUp({
                content: `\`${interaction.toString()}\`\n${error.getErrorMessage()}`,
                ephemeral: true,
            });
        } else {
            await recruitChannel.send(ErrorTexts.UndefinedError);
            await sendErrorLogs(logger, error);
        }
        throw new Error();
    }
}
