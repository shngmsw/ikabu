import util from 'node:util';

import { DBCommon } from './db';
import { TotalReactions } from './model/total_reactions';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class TotalReactionsService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS total_reactions (
                reaction_seq integer PRIMARY KEY AUTOINCREMENT,
                emoji_id text,
                emoji_name text,
                count integer
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(emoji_id: string, emoji_name: string, count: number) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into total_reactions (emoji_id, emoji_name, count)  values ($1, $2, $3)`, [
                emoji_id,
                emoji_name,
                count,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async update(reaction_seq: number, count: number) {
        try {
            DBCommon.init();
            await DBCommon.run(`update total_reactions set count = ${count}  where reaction_seq = ${reaction_seq}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getTotalReactionByEmoji(emoji_id: string, emoji_name: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        return (await db.all(
            `select * from total_reactions where emoji_id = '${emoji_id}' or emoji_name = '${emoji_name}'`,
        )) as TotalReactions[];
    }
}
