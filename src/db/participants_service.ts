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
                                joined_at text,
                                primary key(message_id, user_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerParticipant(participant: Participant) {
        try {
            DBCommon.init();
            await DBCommon.run(`INSERT INTO participants (message_id, user_id, user_type, joined_at) values ($1, $2, $3, $4)`, [
                participant.messageId,
                participant.userId,
                participant.userType,
                participant.joinedAt,
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
        const results = await db.all(`SELECT * FROM participants WHERE message_id = ${messageId} AND user_id = ${userId}`);
        DBCommon.close();
        const participants: Participant[] = [];
        for (let i = 0; i < results.length; i++) {
            participants.push(new Participant(results[i].message_id, results[i].user_id, results[i].user_type, results[i].joined_at));
        }
        return participants;
    }

    static async getAllParticipants(messageId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all);
        const results = await db.all(`SELECT * FROM participants WHERE message_id = ${messageId}`);
        DBCommon.close();
        const participants: Participant[] = [];
        for (let i = 0; i < results.length; i++) {
            participants.push(new Participant(results[i].message_id, results[i].user_id, results[i].user_type, results[i].joined_at));
        }
        return participants;
    }
}
