const DBCommon = require('./db.js');
const FriendCode = require('./model/friend_code');
const log4js = require('log4js');

log4js.configure('config/log4js-config.json');
const logger = log4js.getLogger('database');

module.exports = class FriendCodeService {
    static async createTableIfNotExists() {
        try {
            // force_spectate,hide_winはbooleanだがsqliteにないので0,1で扱う
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS friend_code (
                                user_id text primary key,
                                code text
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(id, code) {
        try {
            DBCommon.init();
            DBCommon.run(`insert or replace into friend_code (user_id, code) values ($1, $2)`, [id, code]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getFriendCodeByUserId(user_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select user_id, code from friend_code where user_id = ${user_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new FriendCode(row['user_id'], row['code']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
