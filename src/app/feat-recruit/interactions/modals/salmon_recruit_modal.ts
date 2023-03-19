// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMess... Remove this comment to see the full error message
const { searchMessageById } = require('../../../common/manager/message_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, sleep } = require('../../../common/others')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitAct... Remove this comment to see the full error message
const { recruitActionRow, recruitDeleteButton } = require('../../buttons/create_recruit_buttons')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Attachment... Remove this comment to see the full error message
const { AttachmentBuilder } = require('discord.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fetchSched... Remove this comment to see the full error message
const { fetchSchedule, checkBigRun } = require('../../../common/apis/splatoon3_ink')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitBig... Remove this comment to see the full error message
const { recruitBigRunCanvas, ruleBigRunCanvas } = require('../../canvases/big_run_canvas')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitSal... Remove this comment to see the full error message
const { recruitSalmonCanvas, ruleSalmonCanvas } = require('../../canvases/salmon_canvas')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js')

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH)
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('recruit')

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  sendSalmonRun
}

async function sendSalmonRun (interaction: $TSFixMe, txt: $TSFixMe, recruit_num: $TSFixMe, condition: $TSFixMe, count: $TSFixMe, host_member: $TSFixMe, user1: $TSFixMe, user2: $TSFixMe) {
  const channel_name = '[簡易版募集]'

  const guild = await interaction.guild.fetch()

  const data = await fetchSchedule()

  let recruitBuffer
  if (checkBigRun(data.schedule, 0)) {
    recruitBuffer = await recruitBigRunCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name)
  } else {
    recruitBuffer = await recruitSalmonCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name)
  }

  let ruleBuffer
  if (checkBigRun(data.schedule, 0)) {
    ruleBuffer = await ruleBigRunCanvas(data)
  } else {
    ruleBuffer = await ruleSalmonCanvas(data)
  }

  const recruit = new AttachmentBuilder(recruitBuffer, { name: 'ikabu_recruit.png' })

  const rule = new AttachmentBuilder(ruleBuffer, 'schedule.png')

  try {
    const mention = '@everyone'
    const image1_message = await interaction.editReply({ content: txt, files: [recruit], ephemeral: false })
    const image2_message = await interaction.channel.send({ files: [rule] })
    const sentMessage = await interaction.channel.send({
      content: mention + ' ボタンを押して参加表明するでし！'
    })

    sentMessage.edit({ components: [recruitActionRow(image1_message)] })
    // @ts-expect-error TS(2304): Cannot find name 'deleteButtonMsg'.
    deleteButtonMsg = await interaction.channel.send({
      components: [recruitDeleteButton(sentMessage, image1_message, image2_message)]
    })
    await interaction.followUp({
      content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/サーモンラン募集 run`を使ってみるでし！\nコマンドを使用すると、細かく条件を設定して募集したり、素早く募集を建てたりできるでし！',
      ephemeral: true
    })

    // ピン留め
    image1_message.pin()

    // 15秒後に削除ボタンを消す
    await sleep(15)
    // @ts-expect-error TS(2304): Cannot find name 'deleteButtonMsg'.
    const deleteButtonCheck = await searchMessageById(guild, interaction.channel.id, deleteButtonMsg.id)
    if (isNotEmpty(deleteButtonCheck)) {
      deleteButtonCheck.delete()
    } else {
      return
    }
  } catch (error) {
    logger.error(error)
  }
}
