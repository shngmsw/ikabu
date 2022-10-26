const sqlite3 = require('sqlite3');

let database;

module.exports = class DBCommon {
    static init() {
        database = new sqlite3.Database('ikabu.sqlite3');
    }
    static get() {
        return database;
    }
};
