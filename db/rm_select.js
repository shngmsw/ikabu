var { getPostgresClient } = require("./db.js");

module.exports = async function getRandomMatchingMessages() {
  const db = await getPostgresClient();
  let result;
  try {
    const sql = "SELECT message_id FROM random_matching_message";

    result = await db.execute(sql);
  } finally {
    await db.release();
    return result;
  }
};
