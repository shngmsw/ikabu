const DBCommon = require('./db.js');
const Members = require('./model/members');

module.exports = class MembersService {
    static async createTableIfNotExists() {
        const db = DBCommon.get();
        return new Promise((resolve, reject) => {
            try {
                // force_spectate,hide_winはbooleanだがsqliteにないので0,1で扱う
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS members (
                                user_id text primary key,
                                message_count integer
                    )`);
                });
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    static async save(id, count) {
        const db = DBCommon.get();
        return new Promise((resolve, reject) => {
            try {
                db.run(`insert or replace into members (user_id, message_count)  values ($1, $2)`, id, count);
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    static async getMemberByUserId(user_id) {
        const db = DBCommon.get();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from members where user_id = ${user_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Members(row['user_id'], row['message_count']));
                    });
                    return resolve(result);
                });
            });
        });
    }
};
