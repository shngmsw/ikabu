import { log4js_obj } from '../../../../log4js_settings';
import { RecruitService } from '../../../../db/recruit_service';
import { BaseGuildTextChannel, ModalSubmitInteraction } from 'discord.js';
import { ParticipantService } from '../../../../db/participants_service';
import { RecruitType } from '../../../../db/model/recruit';
import { RecruitOpCode, regenerateCanvas } from '../../canvases/regenerate_canvas';
import { sendEditRecruitLog } from '../../../logs/modals/recruit_modal_log';
import { regenerateEmbed } from '../../embeds/regenerate_embed';

const logger = log4js_obj.getLogger('interaction');

export async function recruitEdit(interaction: ModalSubmitInteraction, params: URLSearchParams) {
    try {
        const messageId = params.get('mid');
        if (messageId === null) {
            throw new Error('messageId from Params is null.');
        }

        interaction.deferReply({ ephemeral: true });
        const guild = await interaction.guild?.fetch();
        if (guild === undefined) {
            throw new Error('guild cannot fetch.');
        }

        const oldRecruitData = await RecruitService.getRecruit(guild.id, messageId);

        let remaining = interaction.fields.getTextInputValue('remaining');
        remaining = remaining.replace(/\s+/g, '');
        remaining = remaining.replace(/　+/g, '');

        let replyMessage = '';
        if (remaining !== '' && !isNaN(Number(remaining))) {
            replyMessage += await editRecruitNum(guild.id, messageId, oldRecruitData[0].recruitType, Number(remaining));
        }

        const conditionStr = interaction.fields.getTextInputValue('condition');
        let conditionCheck = conditionStr.replace(/\s+/g, '');
        conditionCheck = conditionCheck.replace(/　+/g, '');

        if (conditionCheck !== '') {
            replyMessage += await editCondition(guild.id, messageId, conditionStr);
        }

        if (replyMessage === '') {
            replyMessage = '何も入力されなかったでし！';
        } else {
            replyMessage += '\n**メンバーリストを更新するには参加ボタンを押すでし！**';
        }

        if (interaction.channelId !== null) {
            switch (oldRecruitData[0].recruitType) {
                case RecruitType.RegularRecruit:
                case RecruitType.AnarchyRecruit:
                case RecruitType.LeagueRecruit:
                case RecruitType.SalmonRecruit:
                case RecruitType.FestivalRecruit:
                case RecruitType.BigRunRecruit:
                    await regenerateCanvas(guild, interaction.channelId, messageId, RecruitOpCode.open);
                    break;
                case RecruitType.PrivateRecruit:
                case RecruitType.OtherGameRecruit:
                    await regenerateEmbed(guild, interaction.channelId, messageId, oldRecruitData[0].recruitType);
            }
        }

        const newRecruitData = await RecruitService.getRecruit(guild.id, messageId);
        await sendEditRecruitLog(guild, oldRecruitData[0], newRecruitData[0], interaction.createdAt);

        await interaction.editReply(replyMessage);
    } catch (error) {
        logger.error(error);
        if (interaction.channel instanceof BaseGuildTextChannel) {
            interaction.channel.send('なんかエラー出てるわ');
        }
    }
}

async function editRecruitNum(guildId: string, messageId: string, recruitType: number, remainingNum: number) {
    const participants = await ParticipantService.getAllParticipants(guildId, messageId);
    const recruitersList = [];
    for (const participant of participants) {
        if (participant.userType === 0 || participant.userType === 1) {
            recruitersList.push(participant);
        }
    }
    const memberCount = participants.length + remainingNum;
    let replyMessage;

    let limit;
    switch (recruitType) {
        case RecruitType.AnarchyRecruit:
        case RecruitType.LeagueRecruit:
        case RecruitType.SalmonRecruit:
        case RecruitType.FestivalRecruit:
        case RecruitType.BigRunRecruit:
            limit = 4;
            break;
        case RecruitType.RegularRecruit:
            limit = 8;
            break;
        default:
            limit = 99;
    }

    let recruitNum;
    if (memberCount > limit) {
        recruitNum = limit - recruitersList.length;
        replyMessage = '募集人数が多すぎるでし！\n利用可能な最大値に設定したでし！';
    } else {
        recruitNum = memberCount - recruitersList.length;
        replyMessage = '募集人数を設定したでし！';
    }

    await RecruitService.updateRecruitNum(guildId, messageId, recruitNum);

    return replyMessage;
}

async function editCondition(guildId: string, messageId: string, condition: string) {
    await RecruitService.updateCondition(guildId, messageId, condition);
    return '\n参加条件を更新したでし！';
}
