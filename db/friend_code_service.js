const DBCommon = require('./db.js');
const FriendCode = require('./model/friend_code');

module.exports = class FriendCodeService {
    constructor() {}
    static async createTableIfNotExists() {
        const db = DBCommon.get();
        return new Promise((resolve, reject) => {
            try {
                // force_spectate,hide_winはbooleanだがsqliteにないので0,1で扱う
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS friend_code (
                                user_id text primary key,
                                code text
                    )`);
                });
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    static async save(id, code) {
        const db = DBCommon.get();
        return new Promise((resolve, reject) => {
            try {
                db.run(`insert or replace into friend_code (user_id, code) values ($1, $2)`, id, code);
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    static async getFriendCodeByUserId(user_id) {
        const db = DBCommon.get();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select user_id, code from friend_code where user_id = ${user_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new FriendCode(row['user_id'], row['code']));
                    });
                    return resolve(result);
                });
            });
        });
    }
};
