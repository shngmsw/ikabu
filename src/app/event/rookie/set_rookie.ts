// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchChan... Remove this comment to see the full error message
const { searchChannelById } = require('../../common/manager/channel_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require('../../common/manager/member_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MembersSer... Remove this comment to see the full error message
const MembersService = require('../../../../db/members_service.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FriendCode... Remove this comment to see the full error message
const FriendCodeService = require('../../../../db/friend_code_service.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
const { isEmpty, sleep } = require('../../common/others')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchRole... Remove this comment to see the full error message
const { searchRoleById } = require('../../common/manager/role_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js')

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
  guildMemberAddEvent
}

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH)
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('guildMemberAdd')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'guildMembe... Remove this comment to see the full error message
async function guildMemberAddEvent (member: $TSFixMe) {
  try {
    const guild = await member.guild.fetch()
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    if (guild.id != process.env.SERVER_ID) {
      return
    }
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const lobby_channel = await searchChannelById(guild, process.env.CHANNEL_ID_ROBBY)
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const beginnerRole = await searchRoleById(guild, process.env.ROOKIE_ROLE_ID)

    const sentMessage = await lobby_channel.send(
            `<@!${member.user.id}> たん、よろしくお願いします！\n` +
                // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
                `最初の10分間は閲覧しかできません、その間に <#${process.env.CHANNEL_ID_RULE}> と <#${process.env.CHANNEL_ID_DESCRIPTION}> をよく読んでくださいね\n` +
                // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
                `10分経ったら、書き込めるようになります。 <#${process.env.CHANNEL_ID_INTRODUCTION}> で自己紹介も兼ねて自分のフレコを貼ってください\n\n` +
                `${guild.name}のみんなが歓迎していますよ〜`
    )

    if (isEmpty(beginnerRole)) {
      lobby_channel.send(
        '「新入部員ロールのIDが設定されていないでし！\n気付いた方はサポートセンターまでお問合わせお願いします。」とのことでし！'
      )
    } else {
      const messageCount = await getMessageCount(member.id)
      const friendCode = await FriendCodeService.getFriendCodeByUserId(member.id)
      await sleep(600)
      await setRookieRole(guild, member, beginnerRole, messageCount, friendCode)
      await sentMessage.react('👍')
    }
  } catch (error) {
    logger.error(error)
  }
}

async function setRookieRole (guild: $TSFixMe, member: $TSFixMe, beginnerRole: $TSFixMe, messageCount: $TSFixMe, friendCode: $TSFixMe) {
  if (messageCount == 0 && friendCode.length == 0) {
    const fetch_member = await searchMemberById(guild, member.id)
    if (fetch_member) {
      fetch_member.roles.set([beginnerRole.id]).catch((error: $TSFixMe) => {
        logger.error(error)
      })
    }
  }
}

async function getMessageCount (id: $TSFixMe) {
  const result = await MembersService.getMemberByUserId(id)
  if (result[0] != null) {
    return result[0].message_count
  }
  return 0
}
