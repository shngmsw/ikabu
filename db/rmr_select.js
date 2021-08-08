var { getPostgresClient } = require('./db.js');

module.exports = async function getReactionUsers(messageId) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = "SELECT user_id FROM random_matching_reactions where message_id = $1";
        const params = [messageId];

        result = await db.execute(sql, params);

    } finally {
        await db.release();
        return result;
    }
}