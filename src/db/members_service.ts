// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DBCommon'.
const DBCommon = require('./db.js');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const Members = require('./model/members');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('database');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
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

    static async save(id: $TSFixMe, count: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into members (user_id, message_count)  values ($1, $2)`, [id, count]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMemberByUserId(user_id: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from members where user_id = ${user_id}`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new Members(row['user_id'], row['message_count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
