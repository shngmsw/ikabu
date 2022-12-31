const DBCommon = require('./db.js');
const TotalReactions = require('./model/total_reactions');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('database');

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

    static async save(emoji_id, emoji_name, count) {
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

    static async update(reaction_seq, count) {
        try {
            DBCommon.init();
            await DBCommon.run(`update total_reactions set count = ${count}  where reaction_seq = ${reaction_seq}`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    static async getTotalReactionByEmoji(emoji_id, emoji_name) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select * from total_reactions where emoji_id = '${emoji_id}' or emoji_name = '${emoji_name}'`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new TotalReactions(row['reaction_seq'], row['emoji_id'], row['emoji_name'], row['count']));
                    });
                    DBCommon.close();
                    return resolve(result);
                });
            });
        });
    }
};
