var { getPostgresClient } = require('./db.js');
module.exports = {
    insert_recruit,
};
async function insert_recruit(message_id, author_id, member_id) {
    const db = await getPostgresClient();
    try {
        const sql = 'INSERT INTO recruit (message_id, author_id, member_id) VALUES ($1, $2, $3) ';
        const params = [message_id, author_id, member_id];

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
