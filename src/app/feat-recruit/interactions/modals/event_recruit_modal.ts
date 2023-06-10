import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';

import { Member } from '../../../../db/model/member';
import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { EventMatchInfo } from '../../../common/apis/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitEventCanvas, ruleEventCanvas } from '../../canvases/event_canvas';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function sendEventMatch(
    interaction: ModalSubmitInteraction,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    member: Member,
    user1: Member | null,
    user2: Member | null,
    eventData: EventMatchInfo,
) {
    assertExistCheck(interaction.guild, 'guild');
    assertExistCheck(interaction.channel, 'channel');

    const channelName = '[簡易版募集]';

    const guild = await interaction.guild.fetch();

    const recruiter = new Participant(member.userId, member.displayName, member.iconUrl, 0, new Date());

    let attendee1 = null;
    if (user1 instanceof Member) {
        attendee1 = new Participant(user1.userId, user1.displayName, user1.iconUrl, 1, new Date());
    }

    let attendee2 = null;
    if (user2 instanceof Member) {
        attendee2 = new Participant(user2.userId, user2.displayName, user2.iconUrl, 1, new Date());
    }

    const recruitBuffer = await recruitEventCanvas(
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
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleEventCanvas(eventData), { name: 'rules.png' });

    try {
        const recruitChannel = interaction.channel;
        const mention = `<@&${process.env.ROLE_ID_RECRUIT_EVENT}>`;
        const image1Message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            guild.id,
            recruitChannel.id,
            image1Message.id,
            member.userId,
            recruitNum,
            condition,
            channelName,
            RecruitType.EventRecruit,
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
            content: mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });

        buttonMessage.edit({ components: [recruitActionRow(image1Message)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(buttonMessage, image1Message, image2Message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/イベマ募集 event`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
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
            deleteButtonCheck.delete();
        } else {
            return;
        }

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const recruitData = await RecruitService.getRecruit(guild.id, image1Message.id);
        if (recruitData.length === 0) {
            return;
        }

        const participants = await ParticipantService.getAllParticipants(guild.id, image1Message.id);
        const memberList = getMemberMentions(recruitData[0].recruitNum, participants);
        const hostMention = `<@${member.userId}>`;

        await regenerateCanvas(guild, recruitChannel.id, image1Message.id, RecruitOpCode.close);

        // DBから募集情報削除
        await RecruitService.deleteRecruit(guild.id, image1Message.id);
        await ParticipantService.deleteAllParticipant(image1Message.id);

        buttonMessage.edit({
            content: '`[自動〆]`\n' + `${hostMention}たんの募集は〆！\n${memberList}`,
            components: setButtonDisable(buttonMessage),
        });

        await sendCloseEmbedSticky(guild, recruitChannel);
    } catch (error) {
        logger.error(error);
    }
}