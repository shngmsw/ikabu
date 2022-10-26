const sqlite3 = require('sqlite3');

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
                return console.log('※close時にエラー', err);
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
