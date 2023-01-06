const { searchMessageById } = require('../../../manager/messageManager');
const { isNotEmpty, sleep } = require('../../../common');
const { recruitActionRow, recruitDeleteButton } = require('../../../buttons/recruit/components/create_recruit_buttons');
const { AttachmentBuilder } = require('discord.js');
const { fetchSchedule, checkBigRun } = require('../../../common/apis/splatoon3_ink');
const { recruitBigRunCanvas, ruleBigRunCanvas } = require('../../../canvas/recruit/big_run_canvas');
const { recruitSalmonCanvas, ruleSalmonCanvas } = require('../../../canvas/recruit/salmon_canvas');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruit');

module.exports = {
    sendSalmonRun: sendSalmonRun,
};

async function sendSalmonRun(interaction, txt, recruit_num, condition, count, host_member, user1, user2) {
    const channel_name = '[簡易版募集]';

    const guild = await interaction.guild.fetch();

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

    const recruit = new AttachmentBuilder(recruitBuffer, { name: 'ikabu_recruit.png' });

    const rule = new AttachmentBuilder(ruleBuffer, 'schedule.png');

    try {
        const mention = `@everyone`;
        const header = await interaction.editReply({
            content: txt,
            files: [recruit, rule],
            ephemeral: false,
        });
        const sentMessage = await interaction.channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        sentMessage.edit({ components: [recruitActionRow(header)] });
        deleteButtonMsg = await interaction.channel.send({
            components: [recruitDeleteButton(sentMessage, header)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/サーモンラン募集 run`を使ってみるでし！\nコマンドを使用すると、細かく条件を設定して募集したり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // ピン留め
        header.pin();

        // 15秒後に削除ボタンを消す
        await sleep(15);
        const deleteButtonCheck = await searchMessageById(guild, interaction.channel.id, deleteButtonMsg.id);
        if (isNotEmpty(deleteButtonCheck)) {
            deleteButtonCheck.delete();
        } else {
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}
