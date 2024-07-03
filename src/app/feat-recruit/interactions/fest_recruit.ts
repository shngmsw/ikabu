import { Role } from '@prisma/client';
import { ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';

import { registerRecruitData } from './registerRecruitData';
import { RecruitType } from '../../../db/recruit_service';
import { RoleService } from '../../../db/role_service';
import { getFesRegularData } from '../../common/apis/splatoon3.ink/splatoon3_ink';
import { assertExistCheck, sleep, notExists, getDeveloperMention } from '../../common/others';
import { recruitFestCanvas, ruleFestCanvas } from '../canvases/fest_canvas';
import { RecruitOpCode } from '../canvases/regenerate_canvas';
import { recruitAutoClose } from '../common/auto_close';
import { arrangeRecruitData } from '../common/create_recruit/arrange_command_data';
import { arrangeModalRecruitData } from '../common/create_recruit/arrange_modal_data';
import { removeDeleteButton } from '../common/create_recruit/remove_delete_button';
import {
    sendRecruitCanvas,
    RecruitImageBuffers,
} from '../common/create_recruit/send_recruit_message';
import { sendRecruitSticky } from '../sticky/recruit_sticky_messages';
import { RecruitData } from '../types/recruit_data';

export async function festRecruit(
    interaction: ChatInputCommandInteraction<'cached'> | ModalSubmitInteraction<'cached' | 'raw'>,
) {
    assertExistCheck(interaction.channel, 'channel');
    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: false });

    const recruitName = 'フェス募集';
    const recruitType = RecruitType.FestivalRecruit;
    const recruitRole = await getFestRecruitRole(interaction);
    const teamName = recruitRole.name; // フェスのチーム名

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

    const festBuffers = await getFestImageBuffers(recruitData, recruitRole);

    const recruitMessageList = await sendRecruitCanvas(
        interaction,
        recruitRole.roleId,
        recruitData,
        festBuffers,
    );

    await registerRecruitData(
        recruitMessageList.recruitMessage.id,
        recruitType,
        recruitData,
        teamName,
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

async function getFestImageBuffers(
    recruitData: RecruitData,
    teamRole: Role,
): Promise<RecruitImageBuffers> {
    const voiceChannel = recruitData.voiceChannel;
    const voiceChannelName = voiceChannel ? voiceChannel.name : null;

    const recruitBuffer = await recruitFestCanvas(
        RecruitOpCode.open,
        recruitData.recruitNum,
        recruitData.count,
        recruitData.recruiter,
        recruitData.attendee1,
        recruitData.attendee2,
        recruitData.attendee3,
        teamRole.name,
        teamRole.hexColor,
        recruitData.condition,
        voiceChannelName,
    );

    const festData = await getFesRegularData(recruitData.schedule, recruitData.scheduleNum);
    const ruleBuffer = await ruleFestCanvas(festData);

    return { recruitBuffer: recruitBuffer, ruleBuffer: ruleBuffer };
}

async function getFestRecruitRole(
    interaction:
        | ChatInputCommandInteraction<'cached' | 'raw'>
        | ModalSubmitInteraction<'cached' | 'raw'>,
): Promise<Role> {
    assertExistCheck(interaction.channel, 'channel');
    const teamCharacterName = interaction.channel.name.slice(0, -2); // チャンネル名から'募集'を削除
    const team = teamCharacterName + '陣営';
    const teamRole = await RoleService.searchRole(interaction.guildId, team);

    if (notExists(teamRole)) {
        await interaction.channel.send(
            (await getDeveloperMention(interaction.guildId)) +
                '\nフェスロールの設定がおかしいでし！',
        );
        throw new Error('Festival role is not found');
    }
    return teamRole;
}
