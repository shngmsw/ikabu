import { log4js_obj } from '../log4js_settings';

import util from 'node:util';
import { DBCommon } from './db';
import { Member } from './model/member';
const logger = log4js_obj.getLogger('database');

export class MembersService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS members (
                                guild_id text,
                                user_id text,
                                user_name text,
                                icon_url text,
                                joined_at text,
                                primary key(guild_id, user_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerMember(guildId: string, userId: string, userName: string, iconUrl: string, joinedAt: Date) {
        try {
            DBCommon.init();
            await DBCommon.run(`INSERT INTO members (guild_id, user_id, user_name, icon_url, joined_at)  values ($1, $2, $3, $4 $5)`, [
                guildId,
                userId,
                userName,
                iconUrl,
                joinedAt,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async updateProfile(guildId: string, userId: string, userName: string, iconUrl: string) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE members SET user_name = $1, icon_url = $2 WHERE guild_id = $3 and user_id = $4`, [
                userName,
                iconUrl,
                guildId,
                userId,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async updateJoinDate(guildId: string, userId: string, joinedAt: Date) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE members SET joined_at = $1 WHERE guild_id = $2 and user_id = $3`, [
                joinedAt.toString(),
                guildId,
                userId,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMemberByUserId(guildId: string, userId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = (await db.all(`select * from members where guild_id = ${guildId} and user_id = ${userId}`)) as Member[];
        DBCommon.close();
        return results;
    }
}
