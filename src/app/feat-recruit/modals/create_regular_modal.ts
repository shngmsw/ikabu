import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export async function createRegularModal(interaction: $TSFixMe) {
  const modalParams = new URLSearchParams();
  modalParams.append("recm", "regrec");

  const modal = new ModalBuilder()
    .setCustomId(modalParams.toString())
    .setTitle("ナワバリ募集を作成");

  const recruitNumInput = new TextInputBuilder()
    .setCustomId("rNum")
    .setLabel("募集人数")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("例: 5")
    .setMaxLength(1)
    .setRequired(true);

  const participantsNumInput = new TextInputBuilder()
    .setCustomId("pNum")
    .setLabel("既にいる参加者の数 (あなたを除く)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("例: 2")
    .setMaxLength(1)
    .setRequired(true);

  const participantsList = new TextInputBuilder()
    .setCustomId("pList")
    .setLabel("あなた以外の参加者名を入力")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("例: ブキチ, スパイキー")
    .setRequired(false);

  const conditionInput = new TextInputBuilder()
    .setCustomId("condition")
    .setLabel("参加条件")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("例: 21時まで えんじょい！")
    .setMaxLength(120)
    .setRequired(true);

  const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(recruitNumInput);
  const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(participantsNumInput);
  const actionRow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(participantsList);
  const actionRow4 = new ActionRowBuilder<TextInputBuilder>().addComponents(conditionInput);

  modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

  await interaction.showModal(modal);
}
