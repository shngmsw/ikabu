var { getPostgresClient } = require("./db.js");

module.exports = async function insert(msgId, userId) {
  const db = await getPostgresClient();
  try {
    const sql =
      "INSERT INTO random_matching_reactions (message_id, user_id) VALUES ($1, $2) ";
    const params = [msgId, userId];

    await db.begin();
    await db.execute(sql, params);
    await db.commit();
  } catch (e) {
    await db.rollback();
    console.log(e);
  } finally {
    await db.release();
  }
};
