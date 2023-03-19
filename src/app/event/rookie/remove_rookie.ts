// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Discord'.
const Discord = require('discord.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MembersSer... Remove this comment to see the full error message
const MembersService = require('../../../../db/members_service.js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isNotEmpty... Remove this comment to see the full error message
const { isNotEmpty } = require('../../common/others')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchMemb... Remove this comment to see the full error message
const { searchMemberById } = require('../../common/manager/member_manager')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendIntent... Remove this comment to see the full error message
const { sendIntentionConfirmReply } = require('./send_questionnaire')

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = async function removeRookie (msg: $TSFixMe) {
  const dt = new Date()
  const guild = msg.guild
  const lastMonth = dt.setMonth(dt.getMonth() - 1)
  const member = await searchMemberById(guild, msg.author.id)
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const beginnerRoleId = process.env.ROOKIE_ROLE_ID
  const messageCount = await getMessageCount(msg.member.id)
  if (msg.member.joinedTimestamp < lastMonth || messageCount > 99) {
    const hasBeginnerRole = member.roles.cache.find((role: $TSFixMe) => role.id === beginnerRoleId)
    if (hasBeginnerRole) {
      msg.member.roles.remove([beginnerRoleId])
      const embed = new Discord.EmbedBuilder()
      embed.setDescription('新入部員期間が終わったでし！\nこれからもイカ部心得を守ってイカ部生活をエンジョイするでし！')
      embed.setAuthor({
        name: member.displayName,
        iconURL: member.displayAvatarURL()
      })
      await msg.channel.send({ embeds: [embed] }).catch()
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      if (isNotEmpty(process.env.QUESTIONNAIRE_ROOKIE_URL)) {
        sendIntentionConfirmReply(msg, member, 'QUESTIONNAIRE_ROOKIE_URL')
      }
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
