import { AttachmentBuilder, BaseGuildTextChannel, ModalSubmitInteraction } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { setButtonDisable } from '../../../common/button_components';
import { searchMessageById } from '../../../common/manager/message_manager';
import { searchRoleById, searchRoleIdByName } from '../../../common/manager/role_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitFesCanvas, ruleFesCanvas } from '../../canvases/fes_canvas';
import { getMemberMentions } from '../buttons/other_events';
import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { Member } from '../../../../db/model/member';
import { RecruitOpCode } from '../../canvases/regenerate_canvas';
import { availableRecruitString, sendStickyMessage } from '../../sticky/recruit_sticky_messages';

const logger = log4js_obj.getLogger('recruit');

export async function sendFesMatch(
    interaction: ModalSubmitInteraction,
    team: string,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    member: Member,
    user1: Member | null,
    user2: Member | null,
    fesData: $TSFixMe,
) {
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }
    const mentionId = await searchRoleIdByName(guild, team);
    const teamRole = await searchRoleById(guild, mentionId);

    if (mentionId == null) {
        await interaction.editReply({
            content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
        });
        return;
    }

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

    const recruitBuffer = await recruitFesCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        recruiter,
        attendee1,
        attendee2,
        null,
        team,
        teamRole.hexColor,
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleFesCanvas(fesData), {
        name: 'rules.png',
    });

    try {
        const recruitChannel = interaction.channel;
        if (recruitChannel === null) {
            throw new Error('recruitChannel is null.');
        }
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
            RecruitType.FestivalRecruit,
            team,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromObj(image1Message.id, recruiter);
        if (attendee1 !== null) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, attendee1);
        }
        if (attendee2 !== null) {
            await ParticipantService.registerParticipantFromObj(image1Message.id, attendee2);
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const buttonMessage = await recruitChannel.send({
            content: `<@&${mentionId}>` + ' ボタンを押して参加表明するでし！',
        });

        buttonMessage.edit({ components: [recruitActionRow(image1Message)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(buttonMessage, image1Message, image2Message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/' +
                team +
                ' now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // 募集リスト更新
        if (recruitChannel instanceof BaseGuildTextChannel) {
            const sticky = await availableRecruitString(guild, recruitChannel.id, RecruitType.FestivalRecruit);
            await sendStickyMessage(guild, recruitChannel.id, sticky);
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruitChannel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
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
        const memberList = getMemberMentions(recruitData[0], participants);
        const hostMention = `<@${member.userId}>`;

        // DBから募集情報削除
        await RecruitService.deleteRecruit(guild.id, image1Message.id);
        await ParticipantService.deleteAllParticipant(image1Message.id);

        buttonMessage.edit({
            content: '`[自動〆]`\n' + `${hostMention}たんの募集は〆！\n${memberList}`,
            components: await setButtonDisable(buttonMessage),
        });
    } catch (error) {
        logger.error(error);
    }
}
