import { log4js_obj } from '../log4js_settings';

import util from 'node:util';
import { DBCommon } from './db';
const logger = log4js_obj.getLogger('database');

export class StickyService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS sticky (
                                guild_id text,
                                channel_id text,
                                message_id text,
                                primary key(guild_id, channel_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerMessageId(guildId: string, channelId: string, messageId: string) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `INSERT INTO
                    sticky (guild_id, channel_id, message_id)  values ($1, $2, $3)
                ON CONFLICT
                    (guild_id, channel_id)
                DO UPDATE SET message_id = $3`,
                [guildId, channelId, messageId],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMessageId(guildId: string, channelId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = await db.all(`select message_id from sticky where guild_id = ${guildId} and channel_id = ${channelId}`);
        DBCommon.close();
        const messageIdList: string[] = [];
        for (const result of results) {
            messageIdList.push(result.message_id);
        }
        return messageIdList;
    }
}
