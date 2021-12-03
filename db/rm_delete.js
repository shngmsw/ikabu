var { getPostgresClient } = require("./db.js");
module.exports = {
  deleteRandomMatchingMessages,
  deleteRandomMatchingMessage
};
async function deleteRandomMatchingMessages() {
  const db = await getPostgresClient();
  try {
    const sql = "DELETE from random_matching_message";

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

async function deleteRandomMatchingMessage(messageId) {
  const db = await getPostgresClient();
  try {
    const sql = "DELETE from random_matching_message where message_id = $1";
    const params = [messageId];
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
