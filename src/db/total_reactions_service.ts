// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'DBCommon'.
const DBCommon = require('./db.js');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const TotalReactions = require('./model/total_reactions');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js');

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
log4js.configure(process.env.LOG4JS_CONFIG_PATH);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('database');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = class TotalReactionsService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS total_reactions (
                reaction_seq integer PRIMARY KEY AUTOINCREMENT,
                emoji_id text,
                emoji_name text,
                count integer
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async save(emoji_id: $TSFixMe, emoji_name: $TSFixMe, count: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`insert or replace into total_reactions (emoji_id, emoji_name, count)  values ($1, $2, $3)`, [
                emoji_id,
                emoji_name,
                count,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async update(reaction_seq: $TSFixMe, count: $TSFixMe) {
        try {
            DBCommon.init();
            await DBCommon.run(`update total_reactions set count = ${count}  where reaction_seq = ${reaction_seq}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getTotalReactionByEmoji(emoji_id: $TSFixMe, emoji_name: $TSFixMe) {
        const db = DBCommon.open();
        const result: $TSFixMe = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from total_reactions where emoji_id = '${emoji_id}' or emoji_name = '${emoji_name}'`, (err: $TSFixMe, rows: $TSFixMe) => {
                    if (err) return reject(err);
                    rows.forEach((row: $TSFixMe) => {
                        result.push(new TotalReactions(row['reaction_seq'], row['emoji_id'], row['emoji_name'], row['count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
