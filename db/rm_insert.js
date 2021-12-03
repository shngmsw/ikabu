var { getPostgresClient } = require("./db.js");

module.exports = async function insert(id) {
  const db = await getPostgresClient();
  try {
    const sql = "INSERT INTO random_matching_message (message_id) VALUES ($1) ";
    const params = [id];

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
