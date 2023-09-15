import { Member } from '@prisma/client';
import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';

import { placeHold } from '../../../../constant';
import { ParticipantService } from '../../../../db/participant_service';
import { RecruitService, RecruitType } from '../../../../db/recruit_service';
import { UniqueRoleService } from '../../../../db/unique_role_service';
import { log4js_obj } from '../../../../log4js_settings';
import { MatchInfo } from '../../../common/apis/splatoon3.ink/splatoon3_ink';
import { setButtonDisable } from '../../../common/button_components';
import { getGuildByInteraction } from '../../../common/manager/guild_manager';
import { searchMessageById } from '../../../common/manager/message_manager';
import { assertExistCheck, exists, notExists, sleep } from '../../../common/others';
import { RoleKeySet } from '../../../constant/role_key';
import { sendErrorLogs } from '../../../logs/error/send_error_logs';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitAnarchyCanvas, ruleAnarchyCanvas } from '../../canvases/anarchy_canvas';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';
import { RuleIcon } from '../commands/anarchy_recruit';

const logger = log4js_obj.getLogger('recruit');

export async function sendAnarchyMatch(
    interaction: ModalSubmitInteraction<'cached' | 'raw'>,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    rank: string,
    recruiter: Member,
    attendee1: Member | null,
    attendee2: Member | null,
    anarchyData: MatchInfo,
) {
    let ruleIcon: RuleIcon;
    if (exists(anarchyData && anarchyData.rule)) {
        switch (anarchyData.rule) {
            case 'ガチエリア':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png',
                    xPosition: 600,
                    yPosition: 20,
                    xScale: 90,
                    yScale: 100,
                };
                break;
            case 'ガチヤグラ':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png',
                    xPosition: 595,
                    yPosition: 20,
                    xScale: 90,
                    yScale: 100,
                };
                break;
            case 'ガチホコバトル':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png',
                    xPosition: 585,
                    yPosition: 23,
                    xScale: 110,
                    yScale: 90,
                };
                break;
            case 'ガチアサリ':
                ruleIcon = {
                    url: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png',
                    xPosition: 570,
                    yPosition: 20,
                    xScale: 120,
                    yScale: 100,
                };
                break;
            default:
                ruleIcon = {
                    url: placeHold.error100x100,
                    xPosition: 595,
                    yPosition: 20,
                    xScale: 100,
                    yScale: 100,
                };
                break;
        }
    } else {
        ruleIcon = {
            url: placeHold.error100x100,
            xPosition: 595,
            yPosition: 20,
            xScale: 100,
            yScale: 100,
        };
    }

    const channelName = '[簡易版募集]';

    assertExistCheck(interaction.channel, 'channel');

    const guild = await getGuildByInteraction(interaction);

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

    const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchyData, ruleIcon), {
        name: 'rules.png',
    });

    try {
        const recruitChannel = interaction.channel;
        const anarchyRecruitRoleId = await UniqueRoleService.getRoleIdByKey(
            guild.id,
            RoleKeySet.AnarchyRecruit.key,
        );

        const mention = `<@&${anarchyRecruitRoleId}>`;
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
            RecruitType.AnarchyRecruit,
            rank,
        );

        // DBに参加者情報を登録
        await ParticipantService.registerParticipantFromMember(
            guild.id,
            image1Message.id,
            recruiter,
            0,
        );
        if (exists(attendee1)) {
            await ParticipantService.registerParticipantFromMember(
                guild.id,
                image1Message.id,
                attendee1,
                1,
            );
        }
        if (exists(attendee2)) {
            await ParticipantService.registerParticipantFromMember(
                guild.id,
                image1Message.id,
                attendee2,
                1,
            );
        }

        const image2Message = await recruitChannel.send({ files: [rule] });
        const buttonMessage = await recruitChannel.send({
            content:
                mention + ` ボタンを押して参加表明するでし！\n${getMemberMentions(recruitNum, [])}`,
        });

        await buttonMessage.edit({ components: [recruitActionRow(image1Message)] });
        const deleteButtonMsg = await recruitChannel.send({
            components: [recruitDeleteButton(buttonMessage, image1Message, image2Message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/バンカラ募集 now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // 募集リスト更新
        if (recruitChannel.isTextBased()) {
            await sendRecruitSticky({ channelOpt: { guild: guild, channelId: recruitChannel.id } });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(
            guild,
            recruitChannel.id,
            deleteButtonMsg.id,
        );
        if (exists(deleteButtonCheck)) {
            await deleteButtonCheck.delete();
        } else {
            return;
        }

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const recruitData = await RecruitService.getRecruit(guild.id, image1Message.id);
        if (notExists(recruitData)) {
            return;
        }

        const participants = await ParticipantService.getAllParticipants(
            guild.id,
            image1Message.id,
        );
        const memberList = getMemberMentions(recruitData.recruitNum, participants);
        const hostMention = `<@${recruiter.userId}>`;

        await regenerateCanvas(guild, recruitChannel.id, image1Message.id, RecruitOpCode.close);

        // DBから募集情報削除
        await RecruitService.deleteRecruit(guild.id, image1Message.id);
        await ParticipantService.deleteAllParticipant(guild.id, image1Message.id);

        await buttonMessage.edit({
            content: '`[自動〆]`\n' + `${hostMention}たんの募集は〆！\n${memberList}`,
            components: setButtonDisable(buttonMessage),
        });

        await sendCloseEmbedSticky(guild, recruitChannel);
    } catch (error) {
        await sendErrorLogs(logger, error);
    }
}
