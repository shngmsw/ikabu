const DBCommon = require('./db.js');
const Members = require('./model/members');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('database');

module.exports = class MembersService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS members (
                                user_id text primary key,
                                message_count integer
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(id, count) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into members (user_id, message_count)  values ($1, $2)`, [id, count]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMemberByUserId(user_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from members where user_id = ${user_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Members(row['user_id'], row['message_count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
