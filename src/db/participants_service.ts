import util from 'node:util';

import { DBCommon } from './db.js';
import { Participant } from './model/participant';
import { log4js_obj } from '../log4js_settings';
const logger = log4js_obj.getLogger('database');

export class ParticipantService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS participants (
                                message_id text,
                                user_id text,
                                user_type number,
                                joined_at text,
                                primary key(message_id, user_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerParticipant(messageId: string, userId: string, userType: number, joinedAt: Date) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `INSERT INTO
                    participants (message_id, user_id, user_type, joined_at) values ($1, $2, $3, $4)
                ON CONFLICT
                    (message_id, user_id)
                DO NOTHING`,
                [messageId, userId, userType, joinedAt.toString()],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerParticipantFromObj(messageId: string, participant: Participant) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `INSERT INTO
                    participants (message_id, user_id, user_type, joined_at) values ($1, $2, $3, $4)
                ON CONFLICT
                    (message_id, user_id)
                DO NOTHING`,
                [messageId, participant.userId, participant.userType, participant.joinedAt.toString()],
            );
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

    static async deleteAllParticipant(messageId: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE FROM participants WHERE message_id = ${messageId}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getParticipant(guildId: string, messageId: string, userId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(
            `SELECT 
                P.user_id, M.display_name, M.icon_url,  P.user_type, P.joined_at 
            FROM
                participants as P
            LEFT JOIN
                members as M
            ON
                M.guild_id = ${guildId}
            AND
                M.user_id = P.user_id
            WHERE
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

    static async getAllParticipants(guildId: string, messageId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(
            `SELECT 
                P.user_id, M.display_name, M.icon_url,  P.user_type, P.joined_at 
            FROM
                participants as P
            LEFT JOIN
                members as M
            ON
                M.guild_id = ${guildId}
            AND
                M.user_id = P.user_id
            WHERE
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
