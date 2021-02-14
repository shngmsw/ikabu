var { getPostgresClient } = require('./db.js');

module.exports = async function insertMembers(id, count) {
    const db = await getPostgresClient();
    try {
        const sql = "INSERT INTO members (user_id, message_count) VALUES ($1, $2) "
            + "ON CONFLICT ON CONSTRAINT members_pkey "
            + "DO UPDATE SET message_count=$2";
        const params = [id, count];

        await db.begin();
        await db.execute(sql, params);
        await db.commit();

    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}