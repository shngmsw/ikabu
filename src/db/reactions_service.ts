// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DBCommon'.
const DBCommon = require('./db.js');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const Reactions = require('./model/reactions');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('database');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
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

    static async save(user_id: $TSFixMe, reaction_seq: $TSFixMe, channel_id: $TSFixMe, year: $TSFixMe, count: $TSFixMe) {
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

    static async getReactionCountByPK(user_id: $TSFixMe, reaction_seq: $TSFixMe, channel_id: $TSFixMe, year: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(
                    `select * from reactions where user_id = ${user_id} and reaction_seq = ${reaction_seq} and channel_id = '${channel_id}' and year = '${year}'`,
                    (err: $TSFixMe, rows: $TSFixMe) => {
                        if (err) return reject(err);
                        rows.forEach((row: $TSFixMe) => {
                            result.push(new Reactions(row['user_id'], row['reaction_seq'], row['channel_id'], row['year'], row['count']));
                        });
                        DBCommon.close();
                        return resolve(result);
                    },
                );
            });
        });
    }

    static async getReactionCountByUserId(user_id: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from reactions where user_id = ${user_id}`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new Reactions(row['user_id'], row['reaction_seq'], row['channel_id'], row['year'], row['count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }

    static async getReactionCountByReactionSeq(reaction_seq: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from reactions where reaction_seq = ${reaction_seq}`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new Reactions(row['user_id'], row['reaction_seq'], row['channel_id'], row['year'], row['count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
