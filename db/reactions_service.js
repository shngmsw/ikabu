const DBCommon = require('./db.js');
const Reactions = require('./model/reactions');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('database');

module.exports = class ReactionsService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS reactions (
                user_id text,
                reaction_seq integer,
                year text,
                channel_id text,
                count integer,
                PRIMARY KEY (user_id, reaction_seq, channel_id, year)
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(user_id, reaction_seq, channel_id, year, count) {
        try {
            DBCommon.init();
            await DBCommon.run(
                `insert or replace into reactions (user_id, reaction_seq, channel_id, year, count)  values ($1, $2, $3, $4, $5)`,
                [user_id, reaction_seq, channel_id, year, count],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getReactionCountByPK(user_id, reaction_seq, channel_id, year) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(
                    `select * from reactions where user_id = ${user_id} and reaction_seq = ${reaction_seq} and channel_id = '${channel_id}' and year = '${year}'`,
                    (err, rows) => {
                        if (err) return reject(err);
                        rows.forEach((row) => {
                            result.push(new Reactions(row['user_id'], row['reaction_seq'], row['channel_id'], row['year'], row['count']));
                        });
                        DBCommon.close();
                        return resolve(result);
                    },
                );
            });
        });
    }

    static async getReactionCountByUserId(user_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from reactions where user_id = ${user_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Reactions(row['user_id'], row['reaction_seq'], row['channel_id'], row['year'], row['count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }

    static async getReactionCountByReactionSeq(reaction_seq) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from reactions where reaction_seq = ${reaction_seq}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Reactions(row['user_id'], row['reaction_seq'], row['channel_id'], row['year'], row['count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
