var { getPostgresClient } = require('./db.js');

module.exports = async function insert(id, code) {
    const db = await getPostgresClient();
    try {
        const sql = "INSERT INTO friend_code (user_id, code) VALUES ($1, $2) "
            + "ON CONFLICT ON CONSTRAINT friend_code_pkey "
            + "DO UPDATE SET code=$2";
        const params = [id, code];

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