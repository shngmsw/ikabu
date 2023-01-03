const RecruitService = require('../../../../db/recruit_service');
const { getMemberMentions } = require('../../../event/recruit_button');
const { searchMessageById } = require('../../../manager/messageManager');
const { isNotEmpty, isEmpty, sleep } = require('../../../common');
const { recruitActionRow, recruitDeleteButton } = require('../../../buttons/create_recruit_buttons');
const { setButtonDisable } = require('../../../common/button_components');
const { AttachmentBuilder } = require('discord.js');
const { recruitRegularCanvas, ruleRegularCanvas } = require('../../../canvas/recruit/regular_canvas');
const log4js = require('log4js');

module.exports = {
    sendRegularMatch: sendRegularMatch,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruit');

async function sendRegularMatch(interaction, txt, recruit_num, condition, count, host_member, user1, user2, user3, regular_data) {
    const guild = interaction.guild;
    const channel_name = '[簡易版募集]';

    const recruitBuffer = await recruitRegularCanvas(recruit_num, count, host_member, user1, user2, user3, condition, channel_name);
    const recruit = new AttachmentBuilder(recruitBuffer, { name: 'ikabu_recruit.png' });

    const rule = new AttachmentBuilder(await ruleRegularCanvas(regular_data), { name: 'rules.png' });

    try {
        const mention = `@everyone`;
        const header = await interaction.editReply({ content: txt, files: [recruit, rule], ephemeral: false });
        const sentMessage = await interaction.channel.send({
            content: mention + ' ボタンを押して参加表明するでし！',
        });

        sentMessage.edit({ components: [recruitActionRow(header)] });
        const deleteButtonMsg = await interaction.channel.send({
            components: [recruitDeleteButton(sentMessage, header)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/ナワバリ募集 now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
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

        // 2時間後にボタンを無効化する
        await sleep(7200 - 15);
        const checkMessage = await searchMessageById(guild, interaction.channel.id, sentMessage.id);

        if (isEmpty(checkMessage)) {
            return;
        }
        const message_first_row = checkMessage.content.split('\n')[0];
        if (message_first_row.indexOf('〆') !== -1 || message_first_row.indexOf('キャンセル') !== -1) {
            return;
        }

        const recruit_data = await RecruitService.getRecruitAllByMessageId(checkMessage.id);
        const member_list = getMemberMentions(recruit_data);
        const host_mention = `<@${host_member.user.id}>`;

        checkMessage.edit({
            content: '`[自動〆]`\n' + `${host_mention}たんの募集は〆！\n${member_list}`,
            components: await setButtonDisable(checkMessage),
        });
        // ピン留め解除
        header.unpin();
    } catch (error) {
        logger.error(error);
    }
}
