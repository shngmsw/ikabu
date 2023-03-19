// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'RecruitSer... Remove this comment to see the full error message
const RecruitService = require('../../../../../db/recruit_service')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getMemberM... Remove this comment to see the full error message
const { getMemberMentions } = require('../buttons/recruit_button_events')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMess... Remove this comment to see the full error message
const { searchMessageById } = require('../../../common/manager/message_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require('../../../common/manager/member_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'checkFes'.
const { checkFes, getAnarchyOpenData, fetchSchedule } = require('../../../common/apis/splatoon3_ink')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty, isEmpty, sleep } = require('../../../common/others')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchChan... Remove this comment to see the full error message
const { searchChannelIdByName } = require('../../../common/manager/channel_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitAct... Remove this comment to see the full error message
const { recruitActionRow, recruitDeleteButton, unlockChannelButton } = require('../../buttons/create_recruit_buttons')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setButtonD... Remove this comment to see the full error message
const { setButtonDisable } = require('../../../common/button_components')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Attachment... Remove this comment to see the full error message
const { AttachmentBuilder, ChannelType, PermissionsBitField } = require('discord.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchRole... Remove this comment to see the full error message
const { searchRoleIdByName } = require('../../../common/manager/role_manager')
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
  anarchyRecruit
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'anarchyRec... Remove this comment to see the full error message
async function anarchyRecruit (interaction: $TSFixMe) {
  if (!interaction.isCommand()) return

  const options = interaction.options
  const channel = interaction.channel
  const voice_channel = interaction.options.getChannel('使用チャンネル')
  let rank = options.getString('募集ウデマエ')
  const recruit_num = options.getInteger('募集人数')
  let condition = options.getString('参加条件')
  const guild = await interaction.guild.fetch()
  const host_member = await searchMemberById(guild, interaction.member.user.id)
  const user1 = options.getUser('参加者1')
  const user2 = options.getUser('参加者2')
  let member_counter = recruit_num // プレイ人数のカウンター
  let type

  if (options.getSubcommand() === 'now') {
    type = 0
  } else if (options.getSubcommand() === 'next') {
    type = 1
  }

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
  let mention = '@everyone'
  // 募集条件がランクの場合はウデマエロールにメンション
  if (rank !== undefined && rank !== null) {
    const mention_id = await searchRoleIdByName(guild, rank)
    if (mention_id == null) {
      await interaction.editReply({
        content: '設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！',
        ephemeral: false
      })
      return
    }
    mention = `<@&${mention_id}>`
  } else {
    rank = '指定なし'
  }
  try {
    const data = await fetchSchedule()

    if (checkFes(data.schedule, type)) {
      const fes_channel_id = await searchChannelIdByName(guild, 'フェス募集', ChannelType.GuildText, null)
      await interaction.editReply({
        content: `募集を建てようとした期間はフェス中でし！\nフェス募集をするには<#${fes_channel_id}>のチャンネルを使うでし！`,
        ephemeral: true
      })
      return
    }

    const anarchy_data = await getAnarchyOpenData(data, type)

    let txt = `<@${host_member.user.id}>` + '**たんのバンカラ募集**\n'
    if (user1 != null && user2 != null) {
      txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！'
    } else if (user1 != null) {
      txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！'
    } else if (user2 != null) {
      txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！'
    }

    if (condition == null) condition = 'なし'

    await sendAnarchyMatch(
      interaction,
      mention,
      txt,
      recruit_num,
      condition,
      member_counter,
      rank,
      host_member,
      user1,
      user2,
      anarchy_data
    )
  } catch (error) {
    channel.send('なんかエラーでてるわ')
    logger.error(error)
  }
}

// @ts-expect-error TS(2393): Duplicate function implementation.
async function sendAnarchyMatch (interaction: $TSFixMe, mention: $TSFixMe, txt: $TSFixMe, recruit_num: $TSFixMe, condition: $TSFixMe, count: $TSFixMe, rank: $TSFixMe, host_member: $TSFixMe, user1: $TSFixMe, user2: $TSFixMe, anarchy_data: $TSFixMe) {
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

  const reserve_channel = interaction.options.getChannel('使用チャンネル')

  if (reserve_channel == null) {
    // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
    channel_name = '🔉 VC指定なし'
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
    channel_name = '🔉 ' + reserve_channel.name
  }

  const thumbnail = [thumbnail_url, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY]

  const guild = await interaction.guild.fetch()
  // サーバーメンバーとして取得し直し
  if (user1 != null) {
    user1 = await searchMemberById(guild, user1.id)
  }
  if (user2 != null) {
    user2 = await searchMemberById(guild, user2.id)
  }

  // @ts-expect-error TS(2304): Cannot find name 'channel_name'.
  const recruitBuffer = await recruitAnarchyCanvas(recruit_num, count, host_member, user1, user2, condition, rank, channel_name)
  // @ts-expect-error TS(2339): Property 'png' does not exist on type '{ name: str... Remove this comment to see the full error message
  const recruit = new AttachmentBuilder(recruitBuffer, { name: 'ikabu_recruit.png' }.png)

  const rule = new AttachmentBuilder(await ruleAnarchyCanvas(anarchy_data, thumbnail), { name: 'rules.png' })

  try {
    const image1_message = await interaction.editReply({ content: txt, files: [recruit], ephemeral: false })
    const image2_message = await interaction.channel.send({ files: [rule] })
    const sentMessage = await interaction.channel.send({
      content: mention + ' ボタンを押して参加表明するでし！'
    })

    let isLock = false
    // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
    if (reserve_channel != null && interaction.member.voice.channelId != reserve_channel.id) {
      // vc指定なし
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
    if (isLock) {
      reserve_channel.permissionOverwrites.delete(guild.roles.everyone, 'UnLock Voice Channel')
      reserve_channel.permissionOverwrites.delete(host_member.user, 'UnLock Voice Channel')
    }
  } catch (error) {
    logger.error(error)
  }
}
