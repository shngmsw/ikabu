import util from 'node:util';
import { log4js_obj } from '../log4js_settings';
import { DBCommon } from './db.js';
import { Participant } from './model/participant';
const logger = log4js_obj.getLogger('database');

export class RecruitService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS participants (
                                message_id text,
                                user_id text,
                                user_type number,
                                joined_at text NOT NULL DEFAULT (DATETIME('now', 'localtime'),
                                primary key(message_id, user_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerParticipant(messageId: string, userId: string, userType: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`INSERT INTO participants (message_id, user_id, user_type) values ($1, $2, $3)`, [
                messageId,
                userId,
                userType,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async deleteParticipant(messageId: string, userId: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE FROM participants WHERE message_id = ${messageId} AND user_id = ${userId}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getParticipant(messageId: string, userId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(
            `SELECT 
                P.user_id, M.display_name, M.icon_url,  P.user_type, P.joined_at 
            FROM
                participants as P
            JOIN
                members as M
            ON
                M.guild_id = $1
            AND
                M.user_id = P.user_id
            WHEN
                P.message_id = ${messageId}
            AND
                P.user_id = ${userId}
            ORDER BY
                P.user_type, P.joined_at
            `,
        );
        DBCommon.close();
        const participants: Participant[] = [];
        for (let i = 0; i < results.length; i++) {
            participants.push(
                new Participant(
                    results[i].user_id,
                    results[i].display_name,
                    results[i].icon_url,
                    results[i].user_type,
                    results[i].joined_at,
                ),
            );
        }
        return participants;
    }

    static async getAllParticipants(messageId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(
            `SELECT 
                P.user_id, M.display_name, M.icon_url,  P.user_type, P.joined_at 
            FROM
                participants as P
            JOIN
                members as M
            ON
                M.guild_id = $1
            AND
                M.user_id = P.user_id
            WHEN
                P.message_id = ${messageId}
            ORDER BY
                P.user_type, P.joined_at
            `,
        );
        DBCommon.close();
        const participants: Participant[] = [];
        for (let i = 0; i < results.length; i++) {
            participants.push(
                new Participant(
                    results[i].user_id,
                    results[i].display_name,
                    results[i].icon_url,
                    results[i].user_type,
                    results[i].joined_at,
                ),
            );
        }
        return participants;
    }
}
