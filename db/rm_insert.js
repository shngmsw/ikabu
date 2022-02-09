var { getPostgresClient } = require('./db.js');

module.exports = async function insert(id, author_id) {
  const db = await getPostgresClient();
  try {
    const sql = 'INSERT INTO random_matching_message (message_id, author_id) VALUES ($1, $2) ';
    const params = [id, author_id];

    await db.begin();
    await db.execute(sql, params);
    await db.commit();
  } catch (e) {
    await db.rollback();
    throw e;
  } finally {
    await db.release();
  }
};
