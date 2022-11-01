const sqlite3 = require('sqlite3');
const log4js = require('log4js');

log4js.configure('config/log4js-config.json');
const logger = log4js.getLogger('database');

let database;

module.exports = class DBCommon {
    static init() {
        database = new sqlite3.Database('ikabu.sqlite3');
    }

    static open() {
        return (database = new sqlite3.Database('ikabu.sqlite3'));
    }

    static get() {
        return database;
    }
    static close() {
        database.close((err) => {
            if (err) {
                return logger.error('※close時にエラー', err);
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
