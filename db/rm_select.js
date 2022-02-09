var { getPostgresClient } = require('./db.js');

module.exports = {
  getRandomMatchingMessages,
  getRandomMatchingMessagesByAuthorId,
};

async function getRandomMatchingMessages() {
  const db = await getPostgresClient();
  let result;
  try {
    const sql = 'SELECT message_id, author_id FROM random_matching_message';

    result = await db.execute(sql);
  } finally {
    await db.release();
    return result;
  }
}

async function getRandomMatchingMessagesByAuthorId(message_id, author_id) {
  const db = await getPostgresClient();
  let result;
  try {
    const sql = 'SELECT author_id FROM random_matching_message where message_id = $1 and author_id = $2';
    const params = [message_id, author_id];

    result = await db.execute(sql, params);
  } finally {
    await db.release();
    return result;
  }
}
