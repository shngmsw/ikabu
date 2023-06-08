import util from 'node:util';

import { DBCommon } from './db.js';
import { Recruit } from './model/recruit';
import { log4js_obj } from '../log4js_settings';
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
                                guild_id text,
                                channel_id text,
                                message_id text,
                                author_id text,
                                recruit_num number,
                                condition text,
                                vc_name text,
                                recruit_type number,
                                option text,
                                created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime')),
                                primary key(guild_id, message_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerRecruit(
        guildId: string,
        channelId: string,
        messageId: string,
        authorId: string,
        recruitNum: number,
        condition: string,
        vcName: string | null,
        recruitType: number,
        option?: string | null,
    ) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `INSERT INTO recruit (guild_id, channel_id, message_id, author_id, recruit_num, condition, vc_name, recruit_type, option) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [guildId, channelId, messageId, authorId, recruitNum, condition, vcName, recruitType, option],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteRecruit(guildId: string, messageId: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE FROM recruit WHERE guild_id = ${guildId} AND message_id = ${messageId}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async updateRecruitNum(guildId: string, messageId: string, recruitNum: number) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE recruit SET recruit_num = ${recruitNum} WHERE guild_id = ${guildId} AND message_id = ${messageId}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async updateCondition(guildId: string, messageId: string, condition: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE recruit SET condition = '${condition}' WHERE guild_id = ${guildId} AND message_id = ${messageId}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getRecruit(guildId: string, messageId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`SELECT * FROM recruit WHERE guild_id = ${guildId} AND message_id = ${messageId}`);
        DBCommon.close();
        const recruits: Recruit[] = [];
        for (let i = 0; i < results.length; i++) {
            recruits.push(
                new Recruit(
                    results[i].guild_id,
                    results[i].channel_id,
                    results[i].message_id,
                    results[i].author_id,
                    results[i].recruit_num,
                    results[i].condition,
                    results[i].vc_name,
                    results[i].recruit_type,
                    results[i].option,
                    results[i].created_at,
                ),
            );
        }
        return recruits;
    }

    static async getRecruitsByRecruitType(guildId: string, recruitType: number) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`SELECT * FROM recruit WHERE guild_id = ${guildId} AND recruit_type = ${recruitType}`);
        DBCommon.close();
        const recruits: Recruit[] = [];
        for (let i = 0; i < results.length; i++) {
            recruits.push(
                new Recruit(
                    results[i].guild_id,
                    results[i].channel_id,
                    results[i].message_id,
                    results[i].author_id,
                    results[i].recruit_num,
                    results[i].condition,
                    results[i].vc_name,
                    results[i].recruit_type,
                    results[i].option,
                    results[i].created_at,
                ),
            );
        }
        return recruits;
    }
}
