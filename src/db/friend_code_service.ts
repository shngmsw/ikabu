import { log4js_obj } from "../log4js_settings";
import { DBCommon } from "./db.js";
import { FriendCode } from "./model/friend_code";

const logger = log4js_obj.getLogger("database");

export class FriendCodeService {
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
      DBCommon.run(
        `insert or replace into friend_code (user_id, code) values ($1, $2)`,
        [id, code]
      );
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
        db.all(
          `select user_id, code from friend_code where user_id = ${user_id}`,
          (err: $TSFixMe, rows: $TSFixMe) => {
            if (err) return reject(err);
            rows.forEach((row: $TSFixMe) => {
              result.push(new FriendCode(row["user_id"], row["code"]));
            });
            DBCommon.close();
            return resolve(result);
          }
        );
      });
    });
  }
}
