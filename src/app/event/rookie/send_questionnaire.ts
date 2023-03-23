import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import log4js from "log4js";
import {
  disableThinkingButton,
  recoveryThinkingButton,
  setButtonDisable,
} from "../../common/button_components";
import { searchMessageById } from "../../common/manager/message_manager";
import { isNotEmpty, sleep } from "../../common/others";

/**
 * アンケートに答えるか選択してもらうためのリプライを送信
 * @param {*} message リプライ元
 * @param {*} member 答えるメンバー
 * @param {*} url_key アンケートURLを格納している環境変数のキー名
 */
export async function sendIntentionConfirmReply(
  message: $TSFixMe,
  member: $TSFixMe,
  url_key: $TSFixMe
) {
  const logger = log4js.getLogger("message");
  try {
    const buttons = questionnaireButton(member.id, url_key);
    const sentReply = await message.reply({
      content:
        "よりよい環境づくりのために良ければアンケート調査に協力してほしいでし！\n" +
        "一度`答えない`を押すと再度回答することはできないので注意するでし！\n" +
        "このメッセージは通常2時間で削除されるでし！",
      components: [buttons],
    });
    await sleep(60 * 60 * 2);
    // リプライが残っているか確認 (手動以外で消えることはないはずだけど一応)
    const buttonCheck = await searchMessageById(
      message.guild,
      sentReply.channel.id,
      sentReply.id
    );
    if (isNotEmpty(buttonCheck)) {
      buttonCheck.delete();
    } else {
      return;
    }
  } catch (error: any) {
    if (error.code === 50035) {
      // チャットがすぐに消されて処理が間に合わなかった時にエラーでると面倒なので警告のみ
      logger.warn("questionnaire was not sent. [ message missing! ]");
    } else {
      logger.error(error);
    }
  }
}

function questionnaireButton(user_id: $TSFixMe, url_key: $TSFixMe) {
  const logger = log4js.getLogger();
  try {
    const yesParams = new URLSearchParams();
    yesParams.append("q", "yes");
    yesParams.append("uid", user_id);
    yesParams.append("type", url_key); // 直接URLだと文字数が多すぎる可能性があるため

    const noParams = new URLSearchParams();
    noParams.append("q", "no");
    noParams.append("uid", user_id);

    let buttons = new ActionRowBuilder();
    buttons.addComponents([
      new ButtonBuilder()
        .setCustomId(yesParams.toString())
        .setLabel("答える")
        .setStyle(ButtonStyle.Danger),
    ]);
    buttons.addComponents([
      new ButtonBuilder()
        .setCustomId(noParams.toString())
        .setLabel("答えない")
        .setStyle(ButtonStyle.Primary),
    ]);
    return buttons;
  } catch (error) {
    logger.error(error);
  }
}

export async function sendQuestionnaireFollowUp(
  interaction: $TSFixMe,
  params: $TSFixMe
) {
  const logger = log4js.getLogger("interaction");
  try {
    await interaction.update({
      components: await setButtonDisable(interaction.message, interaction),
    });

    if (interaction.member.user.id !== params.get("uid")) {
      await interaction.followUp({
        content: "他人のアンケートに答えることはできないでし！",
        ephemeral: true,
      });
      await interaction.message.edit({
        components: await recoveryThinkingButton(interaction, "答える"),
      });
      return;
    }

    const q_url = process.env[params.get("type")];
    if (q_url === undefined) {
      throw new Error("アンケートURLが設定されていません");
    }

    const q_url_button = new ActionRowBuilder();
    q_url_button.addComponents([
      new ButtonBuilder()
        .setURL(q_url)
        .setLabel("回答画面へ行く")
        .setStyle(ButtonStyle.Link),
    ]);

    interaction.followUp({
      content:
        "協力ありがとうでし！\n" +
        "このメッセージはDiscordの再起動や画面遷移等によって消える場合があるでし！\n" +
        "すぐに答えない場合は先に回答画面に飛んでおくことをおすすめするでし！",
      components: [q_url_button],
      ephemeral: true,
    });

    await interaction.message.edit({
      components: await disableThinkingButton(interaction, "答える"),
    });
  } catch (error) {
    logger.error(error);
  }
}

export async function disableQuestionnaireButtons(
  interaction: $TSFixMe,
  params: $TSFixMe
) {
  const logger = log4js.getLogger("interaction");
  try {
    await interaction.update({
      components: await setButtonDisable(interaction.message, interaction),
    });

    if (interaction.member.user.id !== params.get("uid")) {
      await interaction.followUp({
        content: "あなたにこのボタンを押す権限はないでし！",
        ephemeral: true,
      });
      await interaction.message.edit({
        components: await recoveryThinkingButton(interaction, "答えない"),
      });
      return;
    }
    await interaction.message.edit({
      components: await disableThinkingButton(interaction, "答えない"),
    });
  } catch (error) {
    logger.error(error);
  }
}
