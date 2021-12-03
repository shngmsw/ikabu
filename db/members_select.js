var { getPostgresClient } = require("./db.js");

module.exports = async function getMember(id) {
  const db = await getPostgresClient();
  let result;
  try {
    const sql = "SELECT * FROM members WHERE user_id = $1";
    const params = [id];

    result = await db.execute(sql, params);
  } finally {
    await db.release();
    return result;
  }
};
