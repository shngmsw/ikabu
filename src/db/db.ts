import sqlite3 from "sqlite3";
import { log4js_obj } from "../log4js_settings";
const logger = log4js_obj.getLogger("database");

let database: $TSFixMe;

export class DBCommon {
  static init() {
    database = new sqlite3.Database("ikabu.sqlite3");
    database.configure("busyTimeout", 5000);
  }

  static open() {
    database = new sqlite3.Database("ikabu.sqlite3");
    database.configure("busyTimeout", 5000);
    return database;
  }

  static get() {
    return database;
  }
  static close() {
    database.close((err: $TSFixMe) => {
      if (err) {
        if (err.errno === 21) {
          return logger.warn("already closed");
        } else {
          return logger.error("※close時にエラー", err);
        }
      }
    });
  }

  static async run(sql: $TSFixMe, params?: $TSFixMe) {
    return new Promise((resolve, reject) => {
      database.run(sql, params, (err: $TSFixMe) => {
        if (err) reject(err);
        // @ts-expect-error TS(2794): Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        resolve();
      });
    });
  }
}
