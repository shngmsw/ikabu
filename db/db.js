const sqlite3 = require('sqlite3');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('database');

let database;

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
        database.close((err) => {
            if (err) {
                if (err.errno === 21) {
                    return logger.warn('already closed');
                } else {
                    return logger.error('※close時にエラー', err);
                }
            }
        });
    }

    static async run(sql, params) {
        return new Promise((resolve, reject) => {
            database.run(sql, params, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
};
