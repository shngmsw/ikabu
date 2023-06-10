import util from 'node:util';

import { DBCommon } from './db';
import { Member } from './model/member';
import { log4js_obj } from '../log4js_settings';
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
            await DBCommon.run(
                `INSERT INTO
                    members (guild_id, user_id, display_name, icon_url, joined_at)  values ($1, $2, $3, $4, $5)
                ON CONFLICT
                    (guild_id, user_id)
                DO UPDATE SET display_name = $3, icon_url = $4`,
                [member.guildId, member.userId, member.displayName, member.iconUrl, member.joinedAt.toString()],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async updateMemberProfile(member: Member) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE members SET display_name = $1, icon_url = $2 WHERE guild_id = $3 and user_id = $4`, [
                member.displayName,
                member.iconUrl,
                member.guildId,
                member.userId,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getMemberByUserId(guildId: string, userId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = await db.all(`select * from members where guild_id = ${guildId} and user_id = ${userId}`);
        const members: Member[] = [];
        for (let i = 0; i < results.length; i++) {
            members.push(
                new Member(results[i].guild_id, results[i].user_id, results[i].display_name, results[i].icon_url, results[i].joined_at),
            );
        }
        DBCommon.close();
        return members;
    }

    static async getMemberGuildsByUserId(userId: string) {
        const db = DBCommon.open();
        db.all = util.promisify(db.all); // https://stackoverflow.com/questions/56122812/async-await-sqlite-in-javascript
        const results = await db.all(`select * from members where user_id = ${userId}`);
        const members: string[] = [];
        for (let i = 0; i < results.length; i++) {
            members.push(results[i].guild_id);
        }
        DBCommon.close();
        return members;
    }
}
