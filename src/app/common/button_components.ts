// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ActionRowB... Remove this comment to see the full error message
const { ActionRowBuilder, ButtonBuilder } = require('discord.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty } = require('./others')

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
  setButtonEnable,
  recoveryThinkingButton,
  disableThinkingButton,
  setButtonDisable
}

/**
 * 考え中ボタンのラベルを更新してボタンを有効化する
 * @param {*} interaction ボタンを押したときのinteraction
 * @param {*} label 押されたボタンに割り当て直すラベル
 * @returns 新しいActionRowオブジェクト
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recoveryTh... Remove this comment to see the full error message
async function recoveryThinkingButton (interaction: $TSFixMe, label: $TSFixMe) {
  const message = interaction.message
  const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
    // create a new action row to add the new data
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow = new ActionRowBuilder()

    // Loop through old action row components (which are buttons in this case)
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow.addComponents(
      oldActionRow.components.map((buttonComponent: $TSFixMe) => {
        if (interaction.component.customId == buttonComponent.customId) {
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton = new ButtonBuilder()
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setLabel(label)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setCustomId(buttonComponent.customId)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setStyle(buttonComponent.style)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setDisabled(false)
        } else {
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton = ButtonBuilder.from(buttonComponent)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setDisabled(false)
        }
        // @ts-expect-error TS(2304): Cannot find name 'newButton'.
        return newButton
      })
    )
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    return updatedActionRow
  })
  return newActionRow
}

/**
 * 考え中ボタンのラベルを更新してボタンを無効化する
 * @param {*} interaction ボタンを押したときのinteraction
 * @param {*} label 押されたボタンに割り当て直すラベル
 * @returns 新しいActionRowオブジェクト
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'disableThi... Remove this comment to see the full error message
async function disableThinkingButton (interaction: $TSFixMe, label: $TSFixMe) {
  const message = interaction.message
  const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
    // create a new action row to add the new data
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow = new ActionRowBuilder()

    // Loop through old action row components (which are buttons in this case)
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow.addComponents(
      oldActionRow.components.map((buttonComponent: $TSFixMe) => {
        if (interaction.component.customId == buttonComponent.customId) {
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton = new ButtonBuilder()
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setLabel(label)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setCustomId(buttonComponent.customId)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setStyle(buttonComponent.style)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setDisabled(true)
        } else {
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton = ButtonBuilder.from(buttonComponent)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setDisabled(true)
        }
        // @ts-expect-error TS(2304): Cannot find name 'newButton'.
        return newButton
      })
    )
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    return updatedActionRow
  })
  return newActionRow
}

/**
 * メッセージに含まれる全てのButtonComponentsを有効化する
 * @param {*} message ボタンが含まれるmessageオブジェクト
 * @returns 新しいActionRowオブジェクト
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setButtonE... Remove this comment to see the full error message
async function setButtonEnable (message: $TSFixMe) {
  const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
    // create a new action row to add the new data
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow = new ActionRowBuilder()

    // Loop through old action row components (which are buttons in this case)
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow.addComponents(
      oldActionRow.components.map((buttonComponent: $TSFixMe) => {
        // create a new button from the old button, to change it if necessary
        // @ts-expect-error TS(2304): Cannot find name 'newButton'.
        newButton = ButtonBuilder.from(buttonComponent)

        // @ts-expect-error TS(2304): Cannot find name 'newButton'.
        newButton.setDisabled(false)

        // @ts-expect-error TS(2304): Cannot find name 'newButton'.
        return newButton
      })
    )
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    return updatedActionRow
  })
  return newActionRow
}

/**
 * ButtonComponentsを無効化する
 * @param {*} message ボタンが含まれるmessageオブジェクト
 * @param {*} interaction 考え中にする場合押されたボタンのインタラクション
 * @returns 新しいActionRowオブジェクト
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setButtonD... Remove this comment to see the full error message
async function setButtonDisable (message: $TSFixMe, interaction = null) {
  const newActionRow = await message.components.map((oldActionRow: $TSFixMe) => {
    // create a new action row to add the new data
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow = new ActionRowBuilder()

    // Loop through old action row components (which are buttons in this case)
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    updatedActionRow.addComponents(
      oldActionRow.components.map((buttonComponent: $TSFixMe) => {
        // create a new button from the old button, to change it if necessary

        // if this was the button that was clicked, this is the one to change!
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        if (isNotEmpty(interaction) && interaction.component.customId == buttonComponent.customId) {
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton = new ButtonBuilder()
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setStyle(buttonComponent.style)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setCustomId(buttonComponent.customId)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setEmoji(process.env.RECRUIT_LOADING_EMOJI_ID)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setDisabled(true)
        } else {
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton = ButtonBuilder.from(buttonComponent)
          // @ts-expect-error TS(2304): Cannot find name 'newButton'.
          newButton.setDisabled(true)
        }
        // @ts-expect-error TS(2304): Cannot find name 'newButton'.
        return newButton
      })
    )
    // @ts-expect-error TS(2304): Cannot find name 'updatedActionRow'.
    return updatedActionRow
  })
  return newActionRow
}
