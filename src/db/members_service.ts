import { log4js_obj } from '../log4js_settings';

import util from 'node:util';
import { DBCommon } from './db';
import { Members } from './model/members';
const logger = log4js_obj.getLogger('database');

export class MembersService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS members (
                                user_id text primary key,
                                message_count integer
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(id: $TSFixMe, count: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into members (user_id, message_count)  values ($1, $2)`, [id, count]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMemberByUserId(user_id: $TSFixMe) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = (await db.all(`select * from members where user_id = ${user_id}`)) as Members[];
        DBCommon.close();
        return results;
    }
}
