import util from 'node:util';
import { log4js_obj } from '../log4js_settings';
import { DBCommon } from './db.js';
import { Recruit } from './model/recruit';
const logger = log4js_obj.getLogger('database');

export class RecruitService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS recruit (
                                message_id text primary key,
                                author_id text,
                                recruit_num number,
                                condition text,
                                created_at text
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerRecruit(recruit: Recruit) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `INSERT INTO recruit (message_id, author_id, recruit_num, condition, created_at) values ($1, $2, $3, $4, $5)`,
                [recruit.messageId, recruit.authorId, recruit.recruitNum, recruit.condition, recruit.createdAt],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteRecruit(messageId: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE FROM recruit WHERE message_id = ${messageId}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getRecruit(messageId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`SELECT * FROM recruit WHERE message_id = ${messageId}`);
        DBCommon.close();
        const recruits: Recruit[] = [];
        for (let i = 0; i < results.length; i++) {
            recruits.push(
                new Recruit(
                    results[i].message_id,
                    results[i].author_id,
                    results[i].recruit_num,
                    results[i].condition,
                    results[i].created_at,
                ),
            );
        }
        return recruits;
    }
}
