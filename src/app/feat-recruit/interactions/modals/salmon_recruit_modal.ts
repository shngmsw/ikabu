import { AttachmentBuilder, GuildMember, ModalSubmitInteraction } from 'discord.js';
import { log4js_obj } from '../../../../log4js_settings';
import { checkBigRun, fetchSchedule } from '../../../common/apis/splatoon3_ink';
import { searchMessageById } from '../../../common/manager/message_manager';
import { isEmpty, isNotEmpty, sleep } from '../../../common/others';
import { recruitActionRow, recruitDeleteButton } from '../../buttons/create_recruit_buttons';
import { recruitBigRunCanvas, ruleBigRunCanvas } from '../../canvases/big_run_canvas';
import { recruitSalmonCanvas, ruleSalmonCanvas } from '../../canvases/salmon_canvas';

const logger = log4js_obj.getLogger('recruit');

export async function sendSalmonRun(
    interaction: ModalSubmitInteraction,
    txt: string,
    recruit_num: number,
    condition: string,
    count: number,
    host_member: GuildMember,
    user1: GuildMember | string | null,
    user2: GuildMember | string | null,
) {
    const guild = await interaction.guild?.fetch();
    if (guild === undefined) {
        throw new Error('guild cannot fetch.');
    }

    const channel_name = '[簡易版募集]';

    const data = await fetchSchedule();

    let recruitBuffer;
    if (checkBigRun(data.schedule, 0)) {
        recruitBuffer = await recruitBigRunCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name);
    } else {
        recruitBuffer = await recruitSalmonCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name);
    }

    let ruleBuffer;
    if (checkBigRun(data.schedule, 0)) {
        ruleBuffer = await ruleBigRunCanvas(data);
    } else {
        ruleBuffer = await ruleSalmonCanvas(data);
    }
    if (isEmpty(recruitBuffer) || recruitBuffer === undefined) {
        throw new Error('recruitBuffer is empty');
    }

    const recruit = new AttachmentBuilder(recruitBuffer, {
        name: 'ikabu_recruit.png',
    });

    if (isEmpty(ruleBuffer) || ruleBuffer == null) {
        throw new Error('recruitBuffer is empty');
    }
    const rule = new AttachmentBuilder(ruleBuffer, { name: 'schedule.png' });

    try {
        const recruit_channel = interaction.channel;
        if (recruit_channel === null) {
            throw new Error('recruit_channel is null.');
        }

        const mention = `<@&${process.env.ROLE_ID_RECRUIT_SALMON}>`;
        const image1_message = await interaction.editReply({
            content: txt,
            files: [recruit],
        });
        const image2_message = await recruit_channel.send({ files: [rule] });
        const sentMessage = await recruit_channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        sentMessage.edit({ components: [recruitActionRow(image1_message)] });
        const deleteButtonMsg = await recruit_channel.send({
            components: [recruitDeleteButton(sentMessage, image1_message, image2_message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/サーモンラン募集 run`を使ってみるでし！\nコマンドを使用すると、細かく条件を設定して募集したり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // ピン留め
        image1_message.pin();

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, recruit_channel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}
