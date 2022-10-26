const { getPostgresClient } = require('../../../../db/db.js');

module.exports = {
    registeredMembersStrings: registeredMembersStrings,
    registerMemberToDB: registerMemberToDB,
    selectMemberFromDB: selectMemberFromDB,
    selectAllMemberFromDB: selectAllMemberFromDB,
    deleteMemberFromDB: deleteMemberFromDB,
    deleteAllMemberFromDB: deleteAllMemberFromDB,
    setTeam: setTeam,
    setCount: setCount,
    setForceSpectate: setForceSpectate,
    getTeamMember: getTeamMember,
    getForceSpectate: getForceSpectate,
    getParticipants: getParticipants,
    setWin: setWin,
    deleteMatchingResult: deleteMatchingResult,
    droptable: droptable,
    setHideWin: setHideWin,
};

/**
 * 0回戦(参加者登録時)の表示を行う
 * @param {*} messageId 登録メッセージID
 * @returns 表示用メッセージ
 */
async function registeredMembersStrings(messageId) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM team_divider where message_id = $1 and match_num = 0 order by created_at';
        const params = [messageId];

        result = await db.execute(sql, params);
    } finally {
        await db.release();
    }

    try {
        let usersString = '';
        for (let i = 0; i < result.length; i++) {
            const member = result[i];
            usersString = usersString + `\n${member.member_name}`;
        }

        registerResults = [usersString, result.length];
        return registerResults;
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function deleteMemberFromDB(messageId, memberId) {
    const db = await getPostgresClient();
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,match_num integer,joined_match_count integer,win integer,force_spectate boolean, hide_win boolean, created_at timestamp)';
        const sql = 'DELETE from team_divider where message_id = $1 and member_id = $2 and match_num = 0';
        const params = [messageId, memberId];

        await db.begin();
        await db.execute(init);
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * DBにメンバーを登録・試合回数更新時にも使用
 * @param {*} messageId 登録メッセージID
 * @param {*} memberId 該当メンバーID
 * @param {*} memberName 該当メンバー表示名
 * @param {*} team 該当チーム(alfa=0, bravo=1, 観戦=2)
 * @param {*} matchNum 試合数
 * @param {*} count 試合参加回数
 * @param {*} win 勝利数
 * @param {*} spectator 参加希望フラグ
 * @param {*} hideWin 戦績非表示フラグ
 */
async function registerMemberToDB(messageId, memberId, memberName, team, matchNum, count, win, spectator, hideWin) {
    const db = await getPostgresClient();
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,match_num integer,joined_match_count integer,win integer,force_spectate boolean, hide_win boolean, created_at timestamp)';
        const sql =
            'INSERT INTO team_divider (message_id, member_id, member_name, team, match_num, joined_match_count, win, force_spectate, hide_win, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, current_timestamp)';
        const params = [messageId, memberId, memberName, team, matchNum, count, win, spectator, hideWin];

        await db.begin();
        await db.execute(init);
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 特定の試合数で特定メンバーを取得
 * @param {*} messageId 登録メッセージID
 * @param {*} matchNum 該当試合数
 * @param {*} memberId 該当メンバーID
 * @returns 取得結果
 */
async function selectMemberFromDB(messageId, matchNum, memberId) {
    const db = await getPostgresClient();
    let result;
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,match_num integer,joined_match_count integer,win integer,force_spectate boolean, hide_win boolean, created_at timestamp)';
        const sql = 'SELECT * FROM team_divider where message_id = $1 and member_id = $2 and match_num = $3';
        const params = [messageId, memberId, matchNum];

        await db.begin();
        await db.execute(init);
        result = await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
    return result;
}

/**
 * 特定の試合数で全メンバーを取得
 * @param {*} messageId 登録メッセージID
 * @param {*} matchNum 該当試合数
 * @returns 取得結果
 */
async function selectAllMemberFromDB(messageId, matchNum) {
    const db = await getPostgresClient();
    let result;
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,match_num integer,joined_match_count integer,win integer,force_spectate boolean, hide_win boolean, created_at timestamp)';
        const sql = 'SELECT * FROM team_divider where message_id = $1 and match_num = $2';
        const params = [messageId, matchNum];

        await db.begin();
        await db.execute(init);
        result = await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
    return result;
}

/**
 * テーブルから該当のチーム分け情報を削除
 * @param {*} messageId 登録メッセージID
 */
async function deleteAllMemberFromDB(messageId) {
    const db = await getPostgresClient();
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,match_num integer,joined_match_count integer,win integer,force_spectate boolean, hide_win boolean, created_at timestamp)';
        const sql = 'DELETE from team_divider where message_id = $1';
        const params = [messageId];
        await db.begin();
        await db.execute(init);
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 特定の試合数のチームを登録
 * @param {*} messageId 登録メッセージID
 * @param {*} memberId 該当メンバーID
 * @param {*} matchNum 該当試合数
 * @param {*} team 該当チーム(alfa=0, bravo=1, 観戦=2)
 */
async function setTeam(messageId, memberId, matchNum, team) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET team = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4';
        const params = [team, messageId, memberId, matchNum];
        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 特定の試合数の試合参加回数を登録
 * @param {*} messageId 登録メッセージID
 * @param {*} memberId 該当メンバーID
 * @param {*} matchNum 該当試合数
 * @param {*} count 試合参加回数
 */
async function setCount(messageId, memberId, matchNum, count) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET joined_match_count = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4';
        const params = [count, messageId, memberId, matchNum];
        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 特定の試合数の勝利数を登録
 * @param {*} messageId 登録メッセージID
 * @param {*} memberId 該当メンバーID
 * @param {*} matchNum 該当試合数
 * @param {*} winCount 勝利数
 */
async function setWin(messageId, memberId, matchNum, winCount) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET win = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4';
        const params = [winCount, messageId, memberId, matchNum];
        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 戦績表示の設定
 * @param {*} messageId 登録メッセージID
 * @param {*} flag true=隠す or false=表示
 */
async function setHideWin(messageId, flag) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET hide_win = $1 WHERE message_id = $2';
        const params = [flag, messageId];
        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 特定の試合数の観戦希望者を登録
 * @param {*} messageId 登録メッセージID
 * @param {*} memberId 該当メンバーID
 * @param {*} matchNum 該当試合数
 * @param {*} flag true or false
 */
async function setForceSpectate(messageId, memberId, matchNum, flag) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET force_spectate = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4';
        const params = [flag, messageId, memberId, matchNum];
        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * 特定の試合数のチームメンバーを取得
 * @param {*} messageId 登録メッセージID
 * @param {*} matchNum 該当試合数
 * @param {*} teamNum 該当チーム(alfa=0, bravo=1, 観戦=2)
 * @returns 取得結果
 */
async function getTeamMember(messageId, matchNum, team) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = `SELECT
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
                        message_id = $1
                    and team = $2
                    and match_num = $3
                    order by
                        created_at`;
        const params = [messageId, team, matchNum];
        await db.begin();
        result = await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
    return result;
}

/**
 * 特定の試合数の観戦希望者を取得
 * @param {*} messageId 登録メッセージID
 * @param {*} matchNum 該当試合数
 * @returns 取得結果
 */
async function getForceSpectate(messageId, matchNum) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM team_divider WHERE message_id = $1 and force_spectate = true and match_num = $2 order by created_at';
        const params = [messageId, matchNum];
        await db.begin();
        result = await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
    return result;
}

/**
 * 特定の試合数の勝率順に並べた試合参加者を取得
 * @param {*} messageId 登録メッセージID
 * @param {*} matchNum 該当試合数
 * @param {*} teamNum 1チームのメンバー数
 * @returns 取得結果
 */
async function getParticipants(messageId, matchNum, teamNum) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = `select
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
                    limit $3;`;
        const params = [messageId, matchNum, teamNum * 2];
        await db.begin();
        result = await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
    return result;
}

/**
 * 特定の試合数のデータを削除する
 * @param {*} messageId 登録メッセージID
 * @param {*} matchNum 該当試合数
 */
async function deleteMatchingResult(messageId, matchNum) {
    const db = await getPostgresClient();
    try {
        const sql = 'DELETE from team_divider where message_id = $1 and match_num = $2';
        const params = [messageId, matchNum];

        await db.begin();
        await db.execute(sql, params);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}

/**
 * for Develop
 */
async function droptable() {
    const db = await getPostgresClient();
    try {
        const sql = 'drop table team_divider;';
        await db.begin();
        await db.execute(sql);
        await db.commit();
    } catch (e) {
        await db.rollback();
        throw e;
    } finally {
        await db.release();
    }
}
