import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';
import { RecruitService } from '../../../../db/recruit_service';
import { log4js_obj } from '../../../../log4js_settings';
import { setButtonDisable } from '../../../common/button_components';
import { searchMessageById } from '../../../common/manager/message_manager';
import { isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitAnarchyCanvas, ruleAnarchyCanvas } from '../../canvases/anarchy_canvas';
import { getMemberMentions } from '../buttons/other_events';
import { Participant } from '../../../../db/model/participant';
import { RecruitType } from '../../../../db/model/recruit';
import { ParticipantService } from '../../../../db/participants_service';
import { Member } from '../../../../db/model/member';
import { RecruitOpCode } from '../buttons/regenerate_image';

const logger = log4js_obj.getLogger('recruit');

export async function sendAnarchyMatch(
    interaction: ModalSubmitInteraction,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    rank: string,
    member: Member,
    user1: Member | null,
    user2: Member | null,
    anarchyData: $TSFixMe,
) {
    let thumbnailUrl; // ガチルールのアイコン
    let thumbnailXP; // アイコンx座標
    let thumbnailYP; // アイコンy座標
    let thumbScaleX; // アイコン幅
    let thumbScaleY; // アイコン高さ
    switch (anarchyData.rule) {
        case 'ガチエリア':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
            thumbnailXP = 600;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチヤグラ':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチホコバトル':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
            thumbnailXP = 585;
            thumbnailYP = 23;
            thumbScaleX = 110;
            thumbScaleY = 90;
            break;
        case 'ガチアサリ':
            thumbnailUrl = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
            thumbnailXP = 570;
            thumbnailYP = 20;
            thumbScaleX = 120;
            thumbScaleY = 100;
            break;
        default:
            thumbnailUrl =
                'http://placehold.jp/15/4c4d57/ffffff/100x100.png?text=ここに画像を貼りたかったんだが、どうやらエラーみたいだ…。';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 100;
            thumbScaleY = 100;
            break;
    }

    const channelName = '[簡易版募集]';

    const thumbnail = [thumbnailUrl, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY];

    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }

    const recruiter = new Participant(member.userId, member.displayName, member.iconUrl, 0, new Date());

    let attendee1 = null;
    if (user1 instanceof Member) {
        attendee1 = new Participant(user1.userId, user1.displayName, user1.iconUrl, 1, new Date());
    }

    let attendee2 = null;
    if (user2 instanceof Member) {
        attendee2 = new Participant(user2.userId, user2.displayName, user2.iconUrl, 1, new Date());
    }

    const recruitBuffer = await recruitAnarchyCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        recruiter,
        attendee1,
        attendee2,
        null,
        condition,
        rank,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchyData, thumbnail), { name: 'rules.png' });

    try {
        const recruitChannel = interaction.channel;
        if (recruitChannel === null) {
            throw new Error('recruitChannel is null.');
        }

        const mention = `<@&${process.env.ROLE_ID_RECRUIT_ANARCHY}>`;
        const image1Message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });

        // DBに募集情報を登録
        await RecruitService.registerRecruit(
            image1Message.id,
            member.userId,
            recruitNum,
            condition,
            channelName,
            RecruitType.AnarchyRecruit,
            rank,
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
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        buttonMessage.edit({ components: [recruitActionRow(image1Message)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(buttonMessage, image1Message, image2Message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/バンカラ募集 now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // ピン留め
        image1Message.pin();

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
        const recruitData = await RecruitService.getRecruit(image1Message.id);
        if (recruitData.length === 0) {
            return;
        }

        const participants = await ParticipantService.getAllParticipants(guild.id, image1Message.id);
        const memberList = getMemberMentions(recruitData[0], participants);
        const hostMention = `<@${member.userId}>`;

        buttonMessage.edit({
            content: '`[自動〆]`\n' + `${hostMention}たんの募集は〆！\n${memberList}`,
            components: await setButtonDisable(buttonMessage),
        });
        // ピン留め解除
        image1Message.unpin();
    } catch (error) {
        logger.error(error);
    }
}
