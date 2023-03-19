// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const sqlite3 = require('sqlite3');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('database');

let database: $TSFixMe;

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class DBCommon {
    static init() {
        database = new sqlite3.Database('ikabu.sqlite3');
        database.configure('busyTimeout', 5000);
    }

    static open() {
        database = new sqlite3.Database('ikabu.sqlite3');
        database.configure('busyTimeout', 5000);
        return database;
    }

    static get() {
        return database;
    }
    static close() {
        database.close((err: $TSFixMe) => {
            if (err) {
                if (err.errno === 21) {
                    return logger.warn('already closed');
                } else {
                    return logger.error('※close時にエラー', err);
                }
            }
        });
    }

    static async run(sql: $TSFixMe, params: $TSFixMe) {
        return new Promise((resolve, reject) => {
            database.run(sql, params, (err: $TSFixMe) => {
                if (err) reject(err);
                // @ts-expect-error TS(2794): Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                resolve();
            });
        });
    }
};
