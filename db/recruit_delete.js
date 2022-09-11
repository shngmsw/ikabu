var { getPostgresClient } = require('./db.js');
module.exports = {
    delete_recruit,
    deleteRecruitByMemberId,
};

async function delete_recruit(message_id) {
    const db = await getPostgresClient();
    try {
        const sql = 'DELETE from recruit where message_id = $1';
        const params = [message_id];
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

async function deleteRecruitByMemberId(message_id, member_id) {
    const db = await getPostgresClient();
    try {
        const sql = 'DELETE from recruit where message_id = $1 and member_id = $2';
        const params = [message_id, member_id];
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
