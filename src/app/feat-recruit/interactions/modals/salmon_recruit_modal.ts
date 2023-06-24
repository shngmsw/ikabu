import { Member } from '@prisma/client';
import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';

import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkBigRun, getSchedule, getSalmonData } from '../../../common/apis/splatoon3.ink/splatoon3_ink';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitBigRunCanvas, ruleBigRunCanvas } from '../../canvases/big_run_canvas';
import { RecruitOpCode } from '../../canvases/regenerate_canvas';
import { recruitSalmonCanvas, ruleSalmonCanvas } from '../../canvases/salmon_canvas';
import { sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function sendSalmonRun(
    interaction: ModalSubmitInteraction<'cached' | 'raw'>,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    recruiter: Member,
    attendee1: Member | null,
    attendee2: Member | null,
) {
    assertExistCheck(interaction.channel, 'channel');

    const guild = await getGuildByInteraction(interaction);

    const channelName = '[簡易版募集]';

    const schedule = await getSchedule();

    if (notExists(schedule)) {
        return await interaction.editReply({
            content: 'スケジュールの取得に失敗したでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
        });
    }

    let recruitBuffer;
    if (checkBigRun(schedule, 0)) {
        recruitBuffer = await recruitBigRunCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            recruiter,
            attendee1,
            attendee2,
            null,
            condition,
            channelName,
        );
    } else {
        recruitBuffer = await recruitSalmonCanvas(
            RecruitOpCode.open,
            recruitNum,
            count,
            recruiter,
            attendee1,
            attendee2,
            null,
            condition,
            channelName,
        );
    }

    let ruleBuffer;
    if (checkBigRun(schedule, 0)) {
        ruleBuffer = await ruleBigRunCanvas(schedule);
    } else {
        const salmonData = await getSalmonData(schedule, 0);
        if (notExists(salmonData)) return null;
        ruleBuffer = await ruleSalmonCanvas(salmonData);
    }
    assertExistCheck(recruitBuffer, 'recruitBuffer');

    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    assertExistCheck(ruleBuffer, 'ruleBuffer');
    const rule = new AttachmentBuilder(ruleBuffer, { name: 'schedule.png' });

    try {
        const recruitChannel = interaction.channel;
        const mention = `<@&${process.env.ROLE_ID_RECRUIT_SALMON}>`;
        const image1Message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });

        if (!image1Message.inGuild()) return;

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            image1Message.id,
            recruiter.userId,
            recruitNum,
            condition,
            channelName,
            RecruitType.SalmonRecruit,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, recruiter, 0);
        if (exists(attendee1)) {
            await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, attendee1, 1);
        }
        if (exists(attendee2)) {
            await ParticipantService.registerParticipantFromMember(guild.id, image1Message.id, attendee2, 1);
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const buttonMessage = await recruitChannel.send({
            content: mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });

        await buttonMessage.edit({ components: [recruitActionRow(image1Message)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(buttonMessage, image1Message, image2Message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/サーモンラン募集 run`を使ってみるでし！\nコマンドを使用すると、細かく条件を設定して募集したり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // 募集リスト更新
        if (recruitChannel.isTextBased()) {
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: recruitChannel.id } });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (exists(deleteButtonCheck)) {
            await deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}
