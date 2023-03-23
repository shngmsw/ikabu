import { MembersService } from "../../../db/members_service";
import { Members } from "../../../db/model/members";

module.exports = async function chatCountUp(msg: $TSFixMe) {
  const id = msg.author.id;
  // membersテーブルがなければ作る
  await MembersService.createTableIfNotExists();
  const messageCount = await getMessageCount(id);
  await MembersService.save(id, messageCount);
};

async function getMessageCount(id: $TSFixMe) {
  let messageCount = 0;
  const result: Members[] = await MembersService.getMemberByUserId(id);
  if (result[0] != null) {
    messageCount = result[0].message_count + 1;
  }
  return messageCount;
}
