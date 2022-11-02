const DBCommon = require('./db.js');
const TeamDivider = require('./model/team_divider');
const log4js = require('log4js');

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('database');

module.exports = class TeamDividerService {
    static async createTableIfNotExists() {
        try {
            DBCommon.init();
            await DBCommon.run(`CREATE TABLE IF NOT EXISTS team_divider (
                        message_id text,
                        member_id text,
                        member_name text,
                        team integer,
                        match_num integer,
                        joined_match_count integer,
                        win integer,
                        force_spectate integer,
                        hide_win integer,
                        created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime'))
                    )`);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 0回戦(参加者登録時)の表示を行う
     * @param {*} messageId 登録メッセージID
     * @returns 表示用メッセージ
     */
    static async registeredMembersStrings(message_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`SELECT * FROM team_divider where message_id = ? and match_num = 0 order by created_at`, message_id, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(
                            new TeamDivider(
                                row['message_id'],
                                row['member_id'],
                                row['member_name'],
                                row['team'],
                                row['match_num'],
                                row['joined_match_count'],
                                row['win'],
                                row['force_spectate'] == 1 ? true : false,
                                row['hide_win'] == 1 ? true : false,
                                0,
                                row['created_at'],
                            ),
                        );
                    });
                    try {
                        let usersString = '';
                        for (let i = 0; i < result.length; i++) {
                            const member = result[i];
                            usersString = usersString + `\n${member.member_name}`;
                        }
                        db.close((err) => {
                            if (err) {
                                return logger.error('※close時にエラー', err);
                            }
                        });

                        return resolve([usersString, result.length]);
                    } catch (err) {
                        logger.error(err);
                        interaction.channel.send('なんかエラー出てるわ');
                    }
                });
            });
        });
    }

    static async deleteMemberFromDB(message_id, member_id) {
        try {
            DBCommon.init();

            await DBCommon.run(`DELETE from team_divider where message_id = $1 and member_id = $2 and match_num = 0`, [
                message_id,
                member_id,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * DBにメンバーを登録・試合回数更新時にも使用
     * @param {*} TeamDivider
     */
    static async registerMemberToDB(teamDivider) {
        try {
            DBCommon.init();

            await DBCommon.run(
                `insert or replace into team_divider (message_id, member_id, member_name, team, match_num, joined_match_count, win, force_spectate, hide_win) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    teamDivider.message_id,
                    teamDivider.member_id,
                    teamDivider.member_name,
                    teamDivider.team,
                    teamDivider.match_num,
                    teamDivider.joined_match_count,
                    teamDivider.win,
                    teamDivider.force_spectate ? 1 : 0,
                    teamDivider.hide_win ? 1 : 0,
                ],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 特定の試合数で特定メンバーを取得
     * @param {*} messageId 登録メッセージID
     * @param {*} matchNum 該当試合数
     * @param {*} memberId 該当メンバーID
     * @returns 取得結果
     */
    static async selectMemberFromDB(message_id, match_num, member_id) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(
                    `SELECT * FROM team_divider where message_id = ? and member_id = ? and match_num = ?`,
                    message_id,
                    member_id,
                    match_num,
                    (err, rows) => {
                        if (err) return reject(err);
                        rows.forEach((row) => {
                            result.push(
                                new TeamDivider(
                                    row['message_id'],
                                    row['member_id'],
                                    row['member_name'],
                                    row['team'],
                                    row['match_num'],
                                    row['joined_match_count'],
                                    row['win'],
                                    row['force_spectate'] == 1 ? true : false,
                                    row['hide_win'] == 1 ? true : false,
                                    0,
                                    row['created_at'],
                                ),
                            );
                        });
                        db.close((err) => {
                            if (err) {
                                return logger.error('※close時にエラー', err);
                            }
                        });
                        return resolve(result);
                    },
                );
            });
        });
    }

    /**
     * 特定の試合数で全メンバーを取得
     * @param {*} messageId 登録メッセージID
     * @param {*} matchNum 該当試合数
     * @returns 取得結果
     */
    static async selectAllMemberFromDB(message_id, match_num) {
        const db = DBCommon.open();
        const result = [];
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`SELECT * FROM team_divider where message_id = ? and match_num = ?`, message_id, match_num, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(
                            new TeamDivider(
                                row['message_id'],
                                row['member_id'],
                                row['member_name'],
                                row['team'],
                                row['match_num'],
                                row['joined_match_count'],
                                row['win'],
                                row['force_spectate'] == 1 ? true : false,
                                row['hide_win'] == 1 ? true : false,
                                0,
                                row['created_at'],
                            ),
                        );
                    });
                    db.close((err) => {
                        if (err) {
                            return logger.error('※close時にエラー', err);
                        }
                    });
                    return resolve(result);
                });
            });
        });
    }

    /**
     * テーブルから該当のチーム分け情報を削除
     * @param {*} messageId 登録メッセージID
     */
    static async deleteAllMemberFromDB(message_id) {
        try {
            DBCommon.init();
            await DBCommon.run(`DELETE from team_divider where message_id = ?`, [message_id]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 特定の試合数のチームを登録
     * @param {*} messageId 登録メッセージID
     * @param {*} memberId 該当メンバーID
     * @param {*} matchNum 該当試合数
     * @param {*} team 該当チーム(alfa=0, bravo=1, 観戦=2)
     */
    static async setTeam(message_id, member_id, match_num, team) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE team_divider SET team = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`, [
                team,
                message_id,
                member_id,
                match_num,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 特定の試合数の試合参加回数を登録
     * @param {*} messageId 登録メッセージID
     * @param {*} memberId 該当メンバーID
     * @param {*} matchNum 該当試合数
     * @param {*} count 試合参加回数
     */
    static async setCount(message_id, member_id, match_num, count) {
        try {
            DBCommon.init();

            await DBCommon.run(
                `UPDATE team_divider SET joined_match_count = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`,
                [count, message_id, member_id, match_num],
            );
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 特定の試合数の勝利数を登録
     * @param {*} messageId 登録メッセージID
     * @param {*} memberId 該当メンバーID
     * @param {*} matchNum 該当試合数
     * @param {*} winCount 勝利数
     */
    static async setWin(message_id, member_id, match_num, win_count) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE team_divider SET win = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`, [
                win_count,
                message_id,
                member_id,
                match_num,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 戦績表示の設定
     * @param {*} messageId 登録メッセージID
     * @param {*} flag true=隠す or false=表示
     */
    static async setHideWin(message_id, flag) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE team_divider SET hide_win = $1 WHERE message_id = $2`, [flag ? 1 : 0, message_id]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 特定の試合数の観戦希望者を登録
     * @param {*} messageId 登録メッセージID
     * @param {*} memberId 該当メンバーID
     * @param {*} matchNum 該当試合数
     * @param {*} flag true or false
     */
    static async setForceSpectate(message_id, member_id, match_num, flag) {
        try {
            DBCommon.init();
            await DBCommon.run(`UPDATE team_divider SET force_spectate = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`, [
                flag ? 1 : 0,
                message_id,
                member_id,
                match_num,
            ]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * 特定の試合数のチームメンバーを取得
     * @param {*} messageId 登録メッセージID
     * @param {*} matchNum 該当試合数
     * @param {*} teamNum 該当チーム(alfa=0, bravo=1, 観戦=2)
     * @returns 取得結果
     */
    static async getTeamMember(message_id, match_num, team) {
        const result = [];
        const db = DBCommon.open();
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(
                    `SELECT
                message_id,
                member_id,
                member_name,
                team,
                joined_match_count,
                win,
                force_spectate,
                hide_win,
                CASE
                    WHEN joined_match_count = 0 then 0
                    ELSE(win * 1.0) / joined_match_count
                END as win_rate
            FROM
                team_divider
            WHERE
                message_id = ?
            and team = ?
            and match_num = ?
            order by
                created_at`,
                    message_id,
                    team,
                    match_num,
                    (err, rows) => {
                        if (err) return reject(err);
                        rows.forEach((row) => {
                            result.push(
                                new TeamDivider(
                                    row['message_id'],
                                    row['member_id'],
                                    row['member_name'],
                                    row['team'],
                                    row['match_num'],
                                    row['joined_match_count'],
                                    row['win'],
                                    row['force_spectate'] == 1 ? true : false,
                                    row['hide_win'] == 1 ? true : false,
                                    row['win_rate'],
                                    row['created_at'],
                                ),
                            );
                        });
                        db.close((err) => {
                            if (err) {
                                return logger.error('※close時にエラー', err);
                            }
                        });
                        return resolve(result);
                    },
                );
            });
        });
    }

    /**
     * 特定の試合数の観戦希望者を取得
     * @param {*} messageId 登録メッセージID
     * @param {*} matchNum 該当試合数
     * @returns 取得結果
     */
    static async getForceSpectate(message_id, match_num) {
        const result = [];
        const db = DBCommon.open();
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(
                    `SELECT * FROM team_divider WHERE message_id = $1 and force_spectate = true and match_num = $2 order by created_at`,
                    message_id,
                    match_num,
                    (err, rows) => {
                        if (err) return reject(err);
                        rows.forEach((row) => {
                            result.push(
                                new TeamDivider(
                                    row['message_id'],
                                    row['member_id'],
                                    row['member_name'],
                                    row['team'],
                                    row['match_num'],
                                    row['joined_match_count'],
                                    row['win'],
                                    row['force_spectate'] == 1 ? true : false,
                                    row['hide_win'] == 1 ? true : false,
                                    0,
                                    row['created_at'],
                                ),
                            );
                        });
                        db.close((err) => {
                            if (err) {
                                return logger.error('※close時にエラー', err);
                            }
                        });
                        return resolve(result);
                    },
                );
            });
        });
    }

    /**
     * 特定の試合数の勝率順に並べた試合参加者を取得
     * @param {*} messageId 登録メッセージID
     * @param {*} matchNum 該当試合数
     * @param {*} teamNum 1チームのメンバー数
     * @returns 取得結果
     */
    static async getParticipants(message_id, match_num, team_num) {
        const result = [];
        const db = DBCommon.open();
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(
                    `select
                        message_id,
                        member_id,
                        joined_match_count,
                        hide_win,
                        CASE
                            WHEN joined_match_count = 0 then 0 
                            ELSE (win * 1.0) / joined_match_count 
                        END as win_rate
                    from
                        team_divider
                    where
                        force_spectate = false
                        and message_id = $1
                        and match_num = $2
                    order by
                        joined_match_count
                    limit $3;`,
                    message_id,
                    match_num,
                    team_num * 2,
                    (err, rows) => {
                        if (err) return reject(err);
                        rows.forEach((row) => {
                            result.push(
                                new TeamDivider(
                                    row['message_id'],
                                    row['member_id'],
                                    row['member_name'],
                                    row['team'],
                                    row['match_num'],
                                    row['joined_match_count'],
                                    row['win'],
                                    row['force_spectate'] == 1 ? true : false,
                                    row['hide_win'] == 1 ? true : false,
                                    row['win_rate'],
                                    row['created_at'],
                                ),
                            );
                        });
                        db.close((err) => {
                            if (err) {
                                return logger.error('※close時にエラー', err);
                            }
                        });
                        return resolve(result);
                    },
                );
            });
        });
    }

    static async getRecruitMessageByAuthorId(author_id) {
        const result = [];
        const db = DBCommon.open();
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`select message_id from recruit where author_id = ${author_id}`, (err, rows) => {
                    if (err) return reject(err);
                    rows.forEach((row) => {
                        result.push(new Recruit(row['user_id'], row['author_id'], row['member_id'], row['created_at']));
                    });
                    db.close((err) => {
                        if (err) {
                            return logger.error('※close時にエラー', err);
                        }
                    });
                    return resolve(result);
                });
            });
        });
    }

    /**
     * 特定の試合数のデータを削除する
     * @param {*} messageId 登録メッセージID
     * @param {*} matchNum 該当試合数
     */
    static async deleteMatchingResult(message_id, match_num) {
        try {
            DBCommon.init();
            DBCommon.run(`DELETE from team_divider where message_id = $1 and match_num = $2`, [message_id, match_num]);
            DBCommon.close();
        } catch (err) {
            logger.error(err);
        }
    }
};
