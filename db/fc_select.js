var { getPostgresClient } = require('./db.js');

module.exports = async function getFC(id) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM friend_code WHERE user_id = $1';
        const params = [id];

        result = await db.execute(sql, params);
    } finally {
        await db.release();
        return result;
    }
};
