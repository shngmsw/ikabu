var { getPostgresClient } = require('./db.js');

module.exports = {
  deleteRandomMatchingReactions,
  deleteRandomMatchingReactionsUser,
  deleteRandomMatchingReactionMessage,
};

async function deleteRandomMatchingReactions() {
  const db = await getPostgresClient();
  try {
    const sql = 'DELETE from random_matching_reactions';

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

async function deleteRandomMatchingReactionsUser(messageId, userId) {
  const db = await getPostgresClient();
  try {
    const sql = 'DELETE from random_matching_reactions where message_id = $1 and user_id = $2';
    const params = [messageId, userId];
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

async function deleteRandomMatchingReactionMessage(messageId) {
  const db = await getPostgresClient();
  try {
    const sql = 'DELETE from random_matching_reactions where message_id = $1';
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
