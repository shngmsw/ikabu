import util from 'node:util';
import { log4js_obj } from '../log4js_settings';
import { DBCommon } from './db';
import { Reactions } from './model/reactions';
const logger = log4js_obj.getLogger('database');

export class ReactionsService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS reactions (
                user_id text,
                reaction_seq integer,
                year text,
                channel_id text,
                count integer,
                PRIMARY KEY (user_id, reaction_seq, channel_id, year)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(user_id: string, reaction_seq: number, channel_id: string, year: number, count: number) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `insert or replace into reactions (user_id, reaction_seq, channel_id, year, count)  values ($1, $2, $3, $4, $5)`,
                [user_id, reaction_seq, channel_id, year, count],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getReactionCountByPK(user_id: string, reaction_seq: number, channel_id: string, year: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = (await db.all(
            `select * from reactions where user_id = ${user_id} and reaction_seq = ${reaction_seq} and channel_id = '${channel_id}' and year = '${year}'`,
        )) as Reactions[];
        DBCommon.close();
        return results;
    }

    static async getReactionCountByUserId(user_id: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = (await db.all(`select * from reactions where user_id = ${user_id}`)) as Reactions[];
        DBCommon.close();
        return results;
    }

    static async getReactionCountByReactionSeq(reaction_seq: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = (await db.all(`select * from reactions where reaction_seq = ${reaction_seq}`)) as Reactions[];
        DBCommon.close();
        return results;
    }
}
