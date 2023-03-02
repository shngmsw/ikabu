const MembersService = require('../../../db/members_service');

module.exports = async function chatCountUp(msg) {
    let id = msg.author.id;
    // membersテーブルがなければ作る
    await MembersService.createTableIfNotExists();
    let messageCount = await getMessageCount(id);
    await MembersService.save(id, messageCount);
};

async function getMessageCount(id) {
    let messageCount = 0;
    let result = await MembersService.getMemberByUserId(id);
    if (result[0] != null) {
        messageCount = result[0].message_count + 1;
    }

    return messageCount;
}
