const DBCommon = require('./db.js');
const Recruit = require('./model/recruit');

module.exports = class RecruitService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS recruit (
                                message_id text,
                                author_id text,
                                member_id text,
                                created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime'))
                    )`);
            DBCommon.close();
        } catch (err) {
            console.log(err);
        }
    }

    static async save(message_id, author_id, member_id) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into recruit (message_id, author_id, member_id) values ($1, $2, $3)`, [
                message_id,
                author_id,
                member_id,
            ]);
            DBCommon.close();
        } catch (err) {
            console.log(err);
        }
    }

    static async deleteByMessageId(message_id) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from recruit where message_id = ${message_id}`);
            DBCommon.close();
        } catch (err) {
            console.log(err);
        }
    }

    static async deleteByMemberId(message_id, member_id) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from recruit where message_id = ${message_id} and member_id = ${member_id}`);
            DBCommon.close();
        } catch (err) {
            console.log(err);
        }
    }

    static async getRecruitAllByMessageId(message_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from recruit where message_id = ${message_id} order by created_at`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }

    static async getRecruitMessageByAuthorId(author_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select message_id from recruit where author_id = ${author_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }

    static async getRecruitMessageByMemberId(message_id, member_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select message_id from recruit where message_id = ${message_id} and member_id =${member_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
