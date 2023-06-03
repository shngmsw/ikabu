import { AttachmentBuilder, BaseGuildTextChannel, ModalSubmitInteraction } from 'discord.js';

import { Member } from '../../../../db/model/member';
import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { checkBigRun, fetchSchedule, getSalmonData } from '../../../common/apis/splatoon3_ink';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitBigRunCanvas, ruleBigRunCanvas } from '../../canvases/big_run_canvas';
import { RecruitOpCode } from '../../canvases/regenerate_canvas';
import { recruitSalmonCanvas, ruleSalmonCanvas } from '../../canvases/salmon_canvas';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages';

const logger = log4js_obj.getLogger('recruit');

export async function sendSalmonRun(
    interaction: ModalSubmitInteraction,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    member: Member,
    user1: Member | null,
    user2: Member | null,
) {
    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const guild = await interaction.guild.fetch();

    const channelName = '[簡易版募集]';

    const recruiter = new Participant(member.userId, member.displayName, member.iconUrl, 0, new Date());

    let attendee1 = null;
    if (user1 instanceof Member) {
        attendee1 = new Participant(user1.userId, user1.displayName, user1.iconUrl, 1, new Date());
    }

    let attendee2 = null;
    if (user2 instanceof Member) {
        attendee2 = new Participant(user2.userId, user2.displayName, user2.iconUrl, 1, new Date());
    }

    const data = await fetchSchedule();

    let recruitBuffer;
    if (checkBigRun(data.schedule, 0)) {
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
    if (checkBigRun(data.schedule, 0)) {
        ruleBuffer = await ruleBigRunCanvas(data);
    } else {
        ruleBuffer = await ruleSalmonCanvas(await getSalmonData(data, 0));
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

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            image1Message.id,
            member.userId,
            recruitNum,
            condition,
            channelName,
            RecruitType.SalmonRecruit,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromObj(image1Message.id, recruiter);
        if (exists(attendee1)) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, attendee1);
        }
        if (exists(attendee2)) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, attendee2);
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const buttonMessage = await recruitChannel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        buttonMessage.edit({ components: [recruitActionRow(image1Message)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(buttonMessage, image1Message, image2Message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/サーモンラン募集 run`を使ってみるでし！\nコマンドを使用すると、細かく条件を設定して募集したり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // 募集リスト更新
        if (recruitChannel instanceof BaseGuildTextChannel) {
            const sticky = await availableRecruitString(guild, recruitChannel.id, RecruitType.SalmonRecruit);
            await sendStickyMessage(guild, recruitChannel.id, sticky);
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (exists(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}
