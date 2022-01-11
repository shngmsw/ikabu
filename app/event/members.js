const insertMembers = require("../../db/members_insert.js");
const getMember = require("../../db/members_select.js");

module.exports = async function chatCountUp(msg) {
    let id = msg.author.id;
    let messageCount = await getMessageCount(id);
    insertMembers(id, messageCount);
}

async function getMessageCount(id) {
    let messageCount = 0;
    let result = await getMember(id);
    if (result[0] != null) {
        messageCount = result[0].message_count + 1;
    }

    return messageCount;
}