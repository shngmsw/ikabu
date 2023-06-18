import sqlite3 from 'sqlite3';

import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

let database: sqlite3.Database;

export class DBCommon {
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
                // @ts-expect-error TS(2339): プロパティ 'errno' は型 'Error' に存在しません。
                if (err.errno === 21) {
                    return logger.warn('already closed');
                } else {
                    return logger.error('※close時にエラー', err);
                }
            }
        });
    }

    static async run(sql: string, callback?: (this: sqlite3.RunResult, err: Error | null) => void) {
        return new Promise<void>((resolve, reject) => {
            database.run(sql, callback, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}
