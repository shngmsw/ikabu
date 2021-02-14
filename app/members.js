const insertMembers = require("../db/members_insert.js");
const getMember = require("../db/members_select.js");

module.exports = function chatCountUp(msg) {
    let id = msg.author.id;
    insertMembers(id, getMessageCount(id));
}

async function getMessageCount(id) {
    let messageCount = 0;
    let result = await getMember(id)[0];
    if (result != null) {
        messageCount = result.message_count + 1;
    }

    return messageCount;
}