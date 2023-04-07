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
                                display_name text,
                                icon_url text,
                                joined_at text,
                                primary key(guild_id, user_id)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async registerMember(member: Member) {
        try {
            DBCommon.init();
            await DBCommon.run(`INSERT INTO members (guild_id, user_id, display_name, icon_url, joined_at)  values ($1, $2, $3, $4, $5)`, [
                member.guild_id,
                member.user_id,
                member.display_name,
                member.icon_url,
                member.joined_at,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async updateMember(member: Member) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE members SET display_name = $1, icon_url = $2, joined_at = $3 WHERE guild_id = $4 and user_id = $5`, [
                member.display_name,
                member.icon_url,
                member.joined_at,
                member.guild_id,
                member.user_id,
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
