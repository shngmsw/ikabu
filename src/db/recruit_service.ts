// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DBCommon'.
const DBCommon = require('./db.js');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const Recruit = require('./model/recruit');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('database');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
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
            logger.error(err);
        }
    }

    static async save(message_id: $TSFixMe, author_id: $TSFixMe, member_id: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into recruit (message_id, author_id, member_id) values ($1, $2, $3)`, [
                message_id,
                author_id,
                member_id,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteByMessageId(message_id: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from recruit where message_id = ${message_id}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteByMemberId(message_id: $TSFixMe, member_id: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from recruit where message_id = ${message_id} and member_id = ${member_id}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getRecruitAllByMessageId(message_id: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from recruit where message_id = ${message_id} order by created_at`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }

    static async getRecruitMessageByAuthorId(author_id: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select message_id from recruit where author_id = ${author_id}`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }

    static async getRecruitMessageByMemberId(message_id: $TSFixMe, member_id: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select message_id from recruit where message_id = ${message_id} and member_id =${member_id}`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
