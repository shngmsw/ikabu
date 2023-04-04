import util from 'node:util';
import { log4js_obj } from '../log4js_settings';
import { DBCommon } from './db.js';
const logger = log4js_obj.getLogger('database');

export class RecruitService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS recruit (
                                message_id text,
                                author_id text,
                                member_id text,
                                created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime'))
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(message_id: $TSFixMe, author_id: $TSFixMe, member_id: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into recruit (message_id, author_id, member_id) values ($1, $2, $3)`, [
                message_id,
                author_id,
                member_id,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteByMessageId(message_id: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from recruit where message_id = ${message_id}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteByMemberId(message_id: $TSFixMe, member_id: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from recruit where message_id = ${message_id} and member_id = ${member_id}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getRecruitAllByMessageId(message_id: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`select * from recruit where message_id = ${message_id} order by created_at`);
        DBCommon.close();
        return results;
    }

    static async getRecruitMessageByAuthorId(author_id: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`select message_id from recruit where author_id = ${author_id}`);
        DBCommon.close();
        return results;
    }

    static async getRecruitMessageByMemberId(message_id: string, member_id: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`select message_id from recruit where message_id = ${message_id} and member_id =${member_id}`);
        DBCommon.close();
        return results;
    }
}
