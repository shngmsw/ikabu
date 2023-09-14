import { Member } from '@prisma/client';
import { AttachmentBuilder, ModalSubmitInteraction } from 'discord.js';

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
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { recruitRegularCanvas, ruleRegularCanvas } from '../../canvases/regular_canvas';
import { sendCloseEmbedSticky, sendRecruitSticky } from '../../sticky/recruit_sticky_messages';
import { getMemberMentions } from '../buttons/other_events';

const logger = log4js_obj.getLogger('recruit');

export async function sendRegularMatch(
    interaction: ModalSubmitInteraction<'cached' | 'raw'>,
    txt: string,
    recruitNum: number,
    condition: string,
    count: number,
    recruiter: Member,
    attendee1: Member | null,
    attendee2: Member | null,
    attendee3: Member | null,
    regularData: MatchInfo,
) {
    assertExistCheck(interaction.channel, 'channel');

    const guild = await getGuildByInteraction(interaction);

    const channelName = '[簡易版募集]';

    const recruitBuffer = await recruitRegularCanvas(
        RecruitOpCode.open,
        recruitNum,
        count,
        recruiter,
        attendee1,
        attendee2,
        attendee3,
        null,
        null,
        null,
        null,
        condition,
        channelName,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    const rule = new AttachmentBuilder(await ruleRegularCanvas(regularData), {
        name: 'rules.png',
    });

    try {
        const recruitChannel = interaction.channel;
        const regularRecruitRoleId = await UniqueRoleService.getRoleIdByKey(
            guild.id,
            RoleKeySet.RegularRecruit.key,
        );

        const mention = `<@&${regularRecruitRoleId}>`;
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
            RecruitType.RegularRecruit,
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
        if (exists(attendee3)) {
            await ParticipantService.registerParticipantFromMember(
                guild.id,
                image1Message.id,
                attendee3,
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
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/ナワバリ募集 now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
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
