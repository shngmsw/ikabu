var { getPostgresClient } = require('./db.js');

module.exports = {
    getRecruitAllByMessageId,
    getRecruitMessageByAuthorId,
    getRecruitMessageByMemberId,
};

async function getRecruitAllByMessageId(message_id) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM recruit where message_id = $1';
        const params = [message_id];

        result = await db.execute(sql, params);
    } finally {
        await db.release();
        return result;
    }
}

async function getRecruitMessageByAuthorId(author_id) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT message_id FROM recruit where author_id = $1';
        const params = [author_id];

        result = await db.execute(sql, params);
    } finally {
        await db.release();
        return result;
    }
}

async function getRecruitMessageByMemberId(message_id, member_id) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT member_id FROM recruit where message_id = $1 and member_id = $2';
        const params = [message_id, member_id];

        result = await db.execute(sql, params);
    } finally {
        await db.release();
        return result;
    }
}
