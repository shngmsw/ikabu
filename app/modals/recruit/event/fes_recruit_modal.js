const RecruitService = require('../../../../db/recruit_service');
const { getMemberMentions } = require('../../../buttons/recruit/event/recruit_button_events');
const { searchMessageById } = require('../../../manager/messageManager');
const { isNotEmpty, isEmpty, sleep } = require('../../../common');
const { recruitActionRow, recruitDeleteButton } = require('../../../buttons/recruit/components/create_recruit_buttons');
const { setButtonDisable } = require('../../../common/button_components');
const { AttachmentBuilder } = require('discord.js');
const { searchRoleIdByName, searchRoleById } = require('../../../manager/roleManager');

const log4js = require('log4js');
const { recruitFesCanvas, ruleFesCanvas } = require('../../../canvas/recruit/fes_canvas');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruit');

module.exports = {
    sendFesMatch: sendFesMatch,
};

async function sendFesMatch(interaction, team, txt, recruit_num, condition, count, host_member, user1, user2, fes_data) {
    const guild = await interaction.guild.fetch();
    const mention_id = await searchRoleIdByName(guild, team);
    const team_role = await searchRoleById(guild, mention_id);

    if (mention_id == null) {
        await interaction.editReply({
            content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
            ephemeral: false,
        });
        return;
    }

    const channel_name = '[簡易版募集]';

    const recruitBuffer = await recruitFesCanvas(
        recruit_num,
        count,
        host_member,
        user1,
        user2,
        team,
        team_role.hexColor,
        condition,
        channel_name,
    );
    const recruit = new AttachmentBuilder(recruitBuffer, { name: 'ikabu_recruit.png' });

    const rule = new AttachmentBuilder(await ruleFesCanvas(fes_data), { name: 'rules.png' });

    try {
        const image1_message = await interaction.editReply({ content: txt, files: [recruit], ephemeral: false });
        const image2_message = await interaction.channel.send({ files: [rule] });
        const sentMessage = await interaction.channel.send({
            content: `<@&${mention_id}>` + ' ボタンを押して参加表明するでし！',
        });

        let deleteButtonMsg;
        sentMessage.edit({ components: [recruitActionRow(image1_message)] });
        deleteButtonMsg = await interaction.channel.send({
            components: [recruitDeleteButton(sentMessage, image1_message, image2_message)],
        });
        await interaction.followUp({
            content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/' +
                team +
                ' now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
            ephemeral: true,
        });

        // ピン留め
        image1_message.pin();

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
        image1_message.unpin();
    } catch (error) {
        logger.error(error);
    }
}
