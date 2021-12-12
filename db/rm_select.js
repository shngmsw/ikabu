var { getPostgresClient } = require("./db.js");

module.exports = {
  getRandomMatchingMessages,
  getRandomMatchingMessagesByAuthorId
};

async function getRandomMatchingMessages() {
  const db = await getPostgresClient();
  let result;
  try {
    const sql = "SELECT message_id, author_id FROM random_matching_message";

    result = await db.execute(sql);
  } finally {
    await db.release();
    return result;
  }
};

async function getRandomMatchingMessagesByAuthorId(author_id) {
  const db = await getPostgresClient();
  let result;
  try {
    const sql =
      "SELECT author_id FROM random_matching_message where author_id = $1";
    const params = [author_id];

    result = await db.execute(sql, params);
  } finally {
    await db.release();
    return result;
  }
}
