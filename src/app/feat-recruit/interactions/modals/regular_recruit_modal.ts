import { AttachmentBuilder } from "discord.js";
import { RecruitService } from "../../../../db/recruit_service";
import { log4js_obj } from "../../../../log4js_settings";
import { setButtonDisable } from "../../../common/button_components";
import { searchMessageById } from "../../../common/manager/message_manager";
import { isEmpty, isNotEmpty, sleep } from "../../../common/others";
import {
  recruitActionRow,
  recruitDeleteButton,
} from "../../buttons/create_recruit_buttons";
import {
  recruitRegularCanvas,
  ruleRegularCanvas,
} from "../../canvases/regular_canvas";
import { getMemberMentions } from "../buttons/recruit_button_events";

const logger = log4js_obj.getLogger("recruit");

export async function sendRegularMatch(
  interaction: $TSFixMe,
  txt: $TSFixMe,
  recruit_num: $TSFixMe,
  condition: $TSFixMe,
  count: $TSFixMe,
  host_member: $TSFixMe,
  user1: $TSFixMe,
  user2: $TSFixMe,
  user3: $TSFixMe,
  regular_data: $TSFixMe
) {
  const guild = interaction.guild;
  const channel_name = "[簡易版募集]";

  const recruitBuffer = await recruitRegularCanvas(
    recruit_num,
    count,
    host_member,
    user1,
    user2,
    user3,
    condition,
    channel_name
  );
  const recruit = new AttachmentBuilder(recruitBuffer, {
    name: "ikabu_recruit.png",
  });

  const rule = new AttachmentBuilder(await ruleRegularCanvas(regular_data), {
    name: "rules.png",
  });

  try {
    const mention = "@everyone";
    const image1_message = await interaction.editReply({
      content: txt,
      files: [recruit],
      ephemeral: false,
    });
    const image2_message = await interaction.channel.send({ files: [rule] });
    const sentMessage = await interaction.channel.send({
      content: mention + " ボタンを押して参加表明するでし！",
    });

    sentMessage.edit({ components: [recruitActionRow(image1_message)] });
    const deleteButtonMsg = await interaction.channel.send({
      components: [
        recruitDeleteButton(sentMessage, image1_message, image2_message),
      ],
    });
    await interaction.followUp({
      content:
        "募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/ナワバリ募集 now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！",
      ephemeral: true,
    });

    // ピン留め
    image1_message.pin();

    // 15秒後に削除ボタンを消す
    await sleep(15);
    const deleteButtonCheck = await searchMessageById(
      guild,
      interaction.channel.id,
      deleteButtonMsg.id
    );
    if (isNotEmpty(deleteButtonCheck)) {
      deleteButtonCheck.delete();
    } else {
      return;
    }

    // 2時間後にボタンを無効化する
    await sleep(7200 - 15);
    const checkMessage = await searchMessageById(
      guild,
      interaction.channel.id,
      sentMessage.id
    );

    if (isEmpty(checkMessage)) {
      return;
    }
    const message_first_row = checkMessage.content.split("\n")[0];
    if (
      message_first_row.indexOf("〆") !== -1 ||
      message_first_row.indexOf("キャンセル") !== -1
    ) {
      return;
    }

    const recruit_data = await RecruitService.getRecruitAllByMessageId(
      checkMessage.id
    );
    const member_list = getMemberMentions(recruit_data);
    const host_mention = `<@${host_member.user.id}>`;

    checkMessage.edit({
      content:
        "`[自動〆]`\n" + `${host_mention}たんの募集は〆！\n${member_list}`,
      components: await setButtonDisable(checkMessage),
    });
    // ピン留め解除
    image1_message.unpin();
  } catch (error) {
    logger.error(error);
  }
}
