import util from 'node:util';
import { log4js_obj } from '../log4js_settings';
import { DBCommon } from './db.js';
import { Recruit } from './model/recruit';
const logger = log4js_obj.getLogger('database');

export class RecruitService {
    /**
     * recruit_type
     * 0: ボタン通知
     * 1: プラベ募集
     * 2: ナワバリ募集
     * 3: バンカラ募集
     * 4: リグマ募集
     * 5: サーモン募集
     * 6: フェス募集
     * 10: 別ゲー募集
     */
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS recruit (
                                message_id text primary key,
                                author_id text,
                                recruit_num number,
                                condition text,
                                channel_name text,
                                recruit_type number,
                                option text,
                                created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime'))
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerRecruit(
        messageId: string,
        authorId: string,
        recruitNum: number,
        condition: string,
        channelName: string | null,
        recruitType: number,
        option?: string,
    ) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `INSERT INTO recruit (message_id, author_id, recruit_num, condition, channel_name, recruit_type, option) values ($1, $2, $3, $4, $5, $6, $7)`,
                [messageId, authorId, recruitNum, condition, channelName, recruitType, option],
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
                    results[i].channel_name,
                    results[i].recruit_type,
                    results[i].option,
                    results[i].created_at,
                ),
            );
        }
        return recruits;
    }
}
