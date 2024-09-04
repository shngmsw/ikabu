import { ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';

import { RecruitType } from '../../../db/recruit_service';
import { UniqueRoleService } from '../../../db/unique_role_service';
import { getEventData, EventMatchInfo } from '../../common/apis/splatoon3.ink/splatoon3_ink';
import { assertExistCheck, exists, sleep } from '../../common/others';
import { RoleKeySet } from '../../constant/role_key';
import { recruitEventCanvas, ruleEventCanvas } from '../canvases/event_canvas';
import { RecruitOpCode } from '../canvases/regenerate_canvas';
import { recruitAutoClose } from '../common/auto_close';
import { arrangeRecruitData } from '../common/create_recruit/arrange_command_data';
import { arrangeModalRecruitData } from '../common/create_recruit/arrange_modal_data';
import { registerRecruitData } from '../common/create_recruit/register_recruit_data';
import { removeDeleteButton } from '../common/create_recruit/remove_delete_button';
import {
    sendRecruitCanvas,
    RecruitImageBuffers,
} from '../common/create_recruit/send_recruit_message';
import { createRecruitEvent } from '../common/vc_reservation/recruit_event';
import { sendRecruitSticky } from '../sticky/recruit_sticky_messages';
import { RecruitData } from '../types/recruit_data';

export async function eventRecruit(
    interaction: ChatInputCommandInteraction<'cached'> | ModalSubmitInteraction<'cached' | 'raw'>,
) {
    assertExistCheck(interaction.channel, 'channel');
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const recruitName = 'イベマ募集';
    const recruitType = RecruitType.EventRecruit;
    const recruitRoleId = await UniqueRoleService.getRoleIdByKey(
        interaction.guildId,
        RoleKeySet.EventRecruit.key,
    );

    let recruitData: RecruitData;
    if (interaction.isCommand()) {
        try {
            recruitData = await arrangeRecruitData(interaction, recruitName, recruitType);
        } catch (error) {
            return;
        }
    } else if (interaction.isModalSubmit()) {
        try {
            recruitData = await arrangeModalRecruitData(interaction, recruitName, recruitType);
        } catch (error) {
            return;
        }
    } else {
        throw new Error('interaction type is invalid');
    }

    const eventData = await getEventData(recruitData.schedule);

    const eventBuffers = await getEventImageBuffers(recruitData, eventData);

    const recruitMessageList = await sendRecruitCanvas(
        interaction,
        recruitRoleId,
        recruitData,
        eventBuffers,
    );

    let eventId: string | null = null;
    if (exists(recruitData.voiceChannel)) {
        eventId = (
            await createRecruitEvent(
                recruitData.guild,
                `イベントマッチ - ${recruitData.recruiter.displayName}`,
                recruitData.recruiter.userId,
                recruitData.voiceChannel,
                eventBuffers.ruleBuffer,
                eventData?.startTime ?? new Date(),
                eventData?.endTime ?? new Date(),
            )
        ).id;
    }

    await registerRecruitData(
        recruitMessageList.recruitMessage.id,
        recruitType,
        recruitData,
        eventId,
        eventData?.title ?? 'えらー',
    );

    // 募集リスト更新
    await sendRecruitSticky({
        channelOpt: { guild: recruitData.guild, channelId: recruitData.recruitChannel.id },
    });

    // 15秒後に削除ボタンを消す
    await sleep(15);

    await removeDeleteButton(recruitData, recruitMessageList.deleteButtonMessage.id);

    // 2時間後にボタンを無効化する
    await sleep(7200 - 15);

    await recruitAutoClose(
        recruitData,
        recruitMessageList.recruitMessage.id,
        recruitMessageList.buttonMessage,
    );
}

async function getEventImageBuffers(
    recruitData: RecruitData,
    eventData: EventMatchInfo | null,
): Promise<RecruitImageBuffers> {
    const voiceChannel = recruitData.voiceChannel;
    const voiceChannelName = voiceChannel ? voiceChannel.name : null;

    const recruitBuffer = await recruitEventCanvas(
        RecruitOpCode.open,
        recruitData.recruitNum,
        recruitData.count,
        recruitData.recruiter,
        recruitData.attendee1,
        recruitData.attendee2,
        recruitData.attendee3,
        recruitData.condition,
        voiceChannelName,
    );

    const ruleBuffer = await ruleEventCanvas(eventData);

    return { recruitBuffer: recruitBuffer, ruleBuffer: ruleBuffer };
}
