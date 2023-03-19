// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Attachment... Remove this comment to see the full error message
const { AttachmentBuilder } = require('discord.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'RecruitSer... Remove this comment to see the full error message
const RecruitService = require('../../../../../db/recruit_service')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getMemberM... Remove this comment to see the full error message
const { getMemberMentions } = require('../buttons/recruit_button_events')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMess... Remove this comment to see the full error message
const { searchMessageById } = require('../../../common/manager/message_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, isEmpty, sleep } = require('../../../common/others')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitAct... Remove this comment to see the full error message
const { recruitActionRow, recruitDeleteButton } = require('../../buttons/create_recruit_buttons')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setButtonD... Remove this comment to see the full error message
const { setButtonDisable } = require('../../../common/button_components')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitAna... Remove this comment to see the full error message
const { recruitAnarchyCanvas, ruleAnarchyCanvas } = require('../../canvases/anarchy_canvas')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js')

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH)
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('recruit')

// @ts-expect-error TS(2580): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  sendAnarchyMatch
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendAnarch... Remove this comment to see the full error message
async function sendAnarchyMatch (interaction: $TSFixMe, txt: $TSFixMe, recruit_num: $TSFixMe, condition: $TSFixMe, count: $TSFixMe, rank: $TSFixMe, host_member: $TSFixMe, user1: $TSFixMe, user2: $TSFixMe, anarchy_data: $TSFixMe) {
  let thumbnail_url // ガチルールのアイコン
  let thumbnailXP // アイコンx座標
  let thumbnailYP // アイコンy座標
  let thumbScaleX // アイコン幅
  let thumbScaleY // アイコン高さ
  switch (anarchy_data.rule) {
    case 'ガチエリア':
      thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png'
      thumbnailXP = 600
      thumbnailYP = 20
      thumbScaleX = 90
      thumbScaleY = 100
      break
    case 'ガチヤグラ':
      thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png'
      thumbnailXP = 595
      thumbnailYP = 20
      thumbScaleX = 90
      thumbScaleY = 100
      break
    case 'ガチホコバトル':
      thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png'
      thumbnailXP = 585
      thumbnailYP = 23
      thumbScaleX = 110
      thumbScaleY = 90
      break
    case 'ガチアサリ':
      thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png'
      thumbnailXP = 570
      thumbnailYP = 20
      thumbScaleX = 120
      thumbScaleY = 100
      break
    default:
      thumbnail_url =
                'http://placehold.jp/15/4c4d57/ffffff/100x100.png?text=ここに画像を貼りたかったんだが、どうやらエラーみたいだ…。'
      thumbnailXP = 595
      thumbnailYP = 20
      thumbScaleX = 100
      thumbScaleY = 100
      break
  }

  const channel_name = '[簡易版募集]'

  const thumbnail = [thumbnail_url, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY]

  const guild = await interaction.guild.fetch()

  const recruitBuffer = await recruitAnarchyCanvas(recruit_num, count, host_member, user1, user2, condition, rank, channel_name)
  const recruit = new AttachmentBuilder(recruitBuffer, { name: 'ikabu_recruit.png' })

  const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchy_data, thumbnail), { name: 'rules.png' })

  try {
    const image1_message = await interaction.editReply({ content: txt, files: [recruit], ephemeral: false })
    const image2_message = await interaction.channel.send({ files: [rule] })
    const sentMessage = await interaction.channel.send({
      content: '@everyone ボタンを押して参加表明するでし！'
    })

    let deleteButtonMsg

    sentMessage.edit({ components: [recruitActionRow(image1_message)] })
    deleteButtonMsg = await interaction.channel.send({
      components: [recruitDeleteButton(sentMessage, image1_message, image2_message)]
    })
    await interaction.followUp({
      content:
                '募集完了でし！\nこの方法での募集は推奨しないでし！\n次回は`/バンカラ募集 now`を使ってみるでし！\nコマンドを使用すると次のスケジュールの募集を建てたり、素早く募集を建てたりできるでし！',
      ephemeral: true
    })

    // ピン留め
    image1_message.pin()

    // 15秒後に削除ボタンを消す
    await sleep(15)
    const deleteButtonCheck = await searchMessageById(guild, interaction.channel.id, deleteButtonMsg.id)
    if (isNotEmpty(deleteButtonCheck)) {
      deleteButtonCheck.delete()
    } else {
      return
    }

    // 2時間後にボタンを無効化する
    await sleep(7200 - 15)
    const checkMessage = await searchMessageById(guild, interaction.channel.id, sentMessage.id)

    if (isEmpty(checkMessage)) {
      return
    }
    const message_first_row = checkMessage.content.split('\n')[0]
    if (message_first_row.indexOf('〆') !== -1 || message_first_row.indexOf('キャンセル') !== -1) {
      return
    }

    const recruit_data = await RecruitService.getRecruitAllByMessageId(checkMessage.id)
    const member_list = getMemberMentions(recruit_data)
    const host_mention = `<@${host_member.user.id}>`

    checkMessage.edit({
      content: '`[自動〆]`\n' + `${host_mention}たんの募集は〆！\n${member_list}`,
      components: await setButtonDisable(checkMessage)
    })
    // ピン留め解除
    image1_message.unpin()
  } catch (error) {
    logger.error(error)
  }
}
