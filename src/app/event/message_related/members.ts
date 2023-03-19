// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MembersSer... Remove this comment to see the full error message
const MembersService = require('../../../../db/members_service')

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = async function chatCountUp (msg: $TSFixMe) {
  const id = msg.author.id
  // membersテーブルがなければ作る
  await MembersService.createTableIfNotExists()
  const messageCount = await getMessageCount(id)
  await MembersService.save(id, messageCount)
}

// @ts-expect-error TS(2393): Duplicate function implementation.
async function getMessageCount (id: $TSFixMe) {
  let messageCount = 0
  const result = await MembersService.getMemberByUserId(id)
  if (result[0] != null) {
    messageCount = result[0].message_count + 1
  }

  return messageCount
}
