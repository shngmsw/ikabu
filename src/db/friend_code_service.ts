// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DBCommon'.
const DBCommon = require('./db.js');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const FriendCode = require('./model/friend_code');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('database');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
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

    static async save(id: $TSFixMe, code: $TSFixMe) {
        try {
            DBCommon.init();
            DBCommon.run(`insert or replace into friend_code (user_id, code) values ($1, $2)`, [id, code]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getFriendCodeByUserId(user_id: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select user_id, code from friend_code where user_id = ${user_id}`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new FriendCode(row['user_id'], row['code']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
