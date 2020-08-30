var { getPostgresClient } = require('./db.js');

module.exports = {
    getFC: getFC
};

async function getFC(id, msg, name) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = "SELECT * FROM friend_code WHERE user_id = $1";
        const params = [id];

        result = await db.execute(sql, params);

    } finally {
        await db.release();
        return result;
    }
}