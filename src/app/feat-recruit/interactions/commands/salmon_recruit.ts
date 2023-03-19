// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMess... Remove this comment to see the full error message
const { searchMessageById } = require('../../../common/manager/message_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require('../../../common/manager/member_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, sleep } = require('../../../common/others')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitAct... Remove this comment to see the full error message
const { recruitActionRow, recruitDeleteButton, unlockChannelButton } = require('../../buttons/create_recruit_buttons')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Attachment... Remove this comment to see the full error message
const { AttachmentBuilder, PermissionsBitField } = require('discord.js')
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
  salmonRecruit
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'salmonRecr... Remove this comment to see the full error message
async function salmonRecruit (interaction: $TSFixMe) {
  if (!interaction.isCommand()) return

  const options = interaction.options
  const channel = interaction.channel
  const voice_channel = interaction.options.getChannel('使用チャンネル')
  const recruit_num = options.getInteger('募集人数')
  let condition = options.getString('参加条件')
  const guild = await interaction.guild.fetch()
  const host_member = await searchMemberById(guild, interaction.member.user.id)
  const user1 = options.getUser('参加者1')
  const user2 = options.getUser('参加者2')
  let member_counter = recruit_num // プレイ人数のカウンター

  if (recruit_num < 1 || recruit_num > 3) {
    await interaction.reply({
      content: '募集人数は1～3までで指定するでし！',
      ephemeral: true
    })
    return
  } else {
    member_counter++
  }

  // プレイヤー指定があればカウンターを増やす
  if (user1 != null) member_counter++
  if (user2 != null) member_counter++

  if (member_counter > 4) {
    await interaction.reply({
      content: '募集人数がおかしいでし！',
      ephemeral: true
    })
    return
  }

  const usable_channel = ['alfa', 'bravo', 'charlie', 'delta', 'echo', 'fox', 'golf', 'hotel', 'india', 'juliett', 'kilo', 'lima', 'mike']

  if (voice_channel != null) {
    if (voice_channel.members.size != 0 && !voice_channel.members.has(host_member.user.id)) {
      await interaction.reply({
        content: 'そのチャンネルは使用中でし！',
        ephemeral: true
      })
      return
    } else if (!usable_channel.includes(voice_channel.name)) {
      await interaction.reply({
        content: 'そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！',
        ephemeral: true
      })
      return
    }
  }

  // 'インタラクションに失敗'が出ないようにするため
  await interaction.deferReply()

  try {
    let txt = `<@${host_member.user.id}>` + '**たんのバイト募集**\n'

    if (user1 != null && user2 != null) {
      txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！'
    } else if (user1 != null) {
      txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！'
    } else if (user2 != null) {
      txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！'
    }

    txt += 'よければ合流しませんか？'

    if (condition == null) condition = 'なし'

    await sendSalmonRun(interaction, txt, recruit_num, condition, member_counter, host_member, user1, user2)
  } catch (error) {
    channel.send('なんかエラーでてるわ')
    logger.error(error)
  }
}

// @ts-expect-error TS(2393): Duplicate function implementation.
async function sendSalmonRun (interaction: $TSFixMe, txt: $TSFixMe, recruit_num: $TSFixMe, condition: $TSFixMe, count: $TSFixMe, host_member: $TSFixMe, user1: $TSFixMe, user2: $TSFixMe) {
  const reserve_channel = interaction.options.getChannel('使用チャンネル')

  if (reserve_channel == null) {
    // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
    channel_name = '🔉 VC指定なし'
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
    channel_name = '🔉 ' + reserve_channel.name
  }

  const guild = await interaction.guild.fetch()
  // サーバーメンバーとして取得し直し
  if (user1 != null) {
    user1 = await searchMemberById(guild, user1.id)
  }
  if (user2 != null) {
    user2 = await searchMemberById(guild, user2.id)
  }

  const data = await fetchSchedule()

  let recruitBuffer
  if (checkBigRun(data.schedule, 0)) {
    // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
    recruitBuffer = await recruitBigRunCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name)
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
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

    let isLock = false
    // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
    if (reserve_channel != null && interaction.member.voice.channelId != reserve_channel.id) {
      isLock = true
    }

    const deleteButtonMsg = await interaction.channel.send({
      components: [recruitDeleteButton(sentMessage, image1_message, image2_message)]
    })
    if (isLock) {
      sentMessage.edit({ components: [recruitActionRow(image1_message, reserve_channel.id)] })
      reserve_channel.permissionOverwrites.set(
        [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.Connect] },
          { id: host_member.user.id, allow: [PermissionsBitField.Flags.Connect] }
        ],
        'Reserve Voice Channel'
      )

      await interaction.followUp({
        content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
        components: [unlockChannelButton(reserve_channel.id)],
        ephemeral: true
      })
    } else {
      sentMessage.edit({ components: [recruitActionRow(image1_message)] })
      await interaction.followUp({
        content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
        ephemeral: true
      })
    }

    // ピン留め
    image1_message.pin()

    // 15秒後に削除ボタンを消す
    await sleep(15)
    const deleteButtonCheck = await searchMessageById(guild, interaction.channel.id, deleteButtonMsg.id)
    if (isNotEmpty(deleteButtonCheck)) {
      deleteButtonCheck.delete()
    } else {
      if (isLock) {
        reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel')
        reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel')
      }
      return
    }

    // 2時間後にVCロックを解除する
    await sleep(7200 - 15)
    // ピン留め解除
    image1_message.unpin()
    if (isLock) {
      reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel')
      reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel')
    }
  } catch (error) {
    logger.error(error)
  }
}
