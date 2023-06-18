import util from 'node:util';

import { DBCommon } from './db';
import { MessageCount } from './model/message_count';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class MessageCountService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS message_count (
                                user_id text primary key,
                                count integer
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(id: string, count: number) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into message_count (user_id, count)  values ($1, $2)`, [id, count]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMemberByUserId(user_id: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = (await db.all(`select * from message_count where user_id = ${user_id}`)) as MessageCount[];
        DBCommon.close();
        return results;
    }
}
