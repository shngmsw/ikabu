var { getPostgresClient } = require('./db.js');

module.exports = async function deleteRandomMatchingReactions() {
    const db = await getPostgresClient();
    try {
        const sql = "DELETE from random_matching_reactions";

        await db.begin();
        await db.execute(sql);
        await db.commit();

    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}