const { getPostgresClient } = require('../../../../db/db');

module.exports = {
    registeredMembersString: registeredMembersString,
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
};

async function registeredMembersString(messageId) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM team_divider where message_id = $1 order by created_at';
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
        return usersString;
    } catch (err) {
        console.error(err);
        interaction.channel.send('なんかエラー出てるわ');
    }
}

async function registerMemberToDB(messageId, memberId, memberName, team, count, win, spectator) {
    const db = await getPostgresClient();
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,joined_match_count integer,win integer,force_spectate boolean,created_at timestamp)';
        const sql =
            'INSERT INTO team_divider (message_id, member_id, member_name, team, joined_match_count, win, force_spectate, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, current_timestamp)';
        const params = [messageId, memberId, memberName, team, count, win, spectator];

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

async function selectMemberFromDB(messageId, memberId) {
    const db = await getPostgresClient();
    let result;
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,joined_match_count integer,win integer,force_spectate boolean,created_at timestamp)';
        const sql = 'SELECT * FROM team_divider where message_id = $1 and member_id = $2';
        const params = [messageId, memberId];

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

async function selectAllMemberFromDB(messageId) {
    const db = await getPostgresClient();
    let result;
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,joined_match_count integer,win integer,force_spectate boolean,created_at timestamp)';
        const sql = 'SELECT * FROM team_divider where message_id = $1';
        const params = [messageId];

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

async function deleteMemberFromDB(messageId, memberId) {
    const db = await getPostgresClient();
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,joined_match_count integer,win integer,force_spectate boolean,created_at timestamp)';
        const sql = 'DELETE from team_divider where message_id = $1 and member_id = $2';
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

async function deleteAllMemberFromDB(messageId) {
    const db = await getPostgresClient();
    try {
        const init =
            'CREATE TABLE IF NOT EXISTS team_divider (message_id varchar(20),member_id varchar(20),member_name varchar(64),team integer,joined_match_count integer,win integer,force_spectate boolean,created_at timestamp)';
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

async function setTeam(messageId, memberId, team) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET team = $1 WHERE message_id = $2 and member_id = $3';
        const params = [team, messageId, memberId];
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

async function setCount(messageId, memberId, count) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET joined_match_count = $1 WHERE message_id = $2 and member_id = $3';
        const params = [count, messageId, memberId];
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

async function setWin(messageId, memberId, winCount) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET win = $1 WHERE message_id = $2 and member_id = $3';
        const params = [winCount, messageId, memberId];
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

async function setForceSpectate(messageId, memberId, flag) {
    const db = await getPostgresClient();
    try {
        const sql = 'UPDATE team_divider SET force_spectate = $1 WHERE message_id = $2 and member_id = $3';
        const params = [flag, messageId, memberId];
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

async function getTeamMember(messageId, team) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM team_divider WHERE message_id = $1 and team = $2 order by created_at';
        const params = [messageId, team];
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

async function getForceSpectate(messageId) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = 'SELECT * FROM team_divider WHERE message_id = $1 and force_spectate = true order by created_at';
        const params = [messageId];
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

async function getParticipants(messageId, teamNum) {
    const db = await getPostgresClient();
    let result;
    try {
        const sql = `select
                        message_id,
                        member_id,
                        joined_match_count,
                        CASE
                            WHEN joined_match_count = 0 then 0 
                            ELSE (win * 1.0) / joined_match_count 
                        END as win_rate
                    from
                        team_divider
                    where
                        force_spectate = false
                        and message_id = $1
                    order by
                        joined_match_count
                        ,win_rate
                    limit $2;`;
        const params = [messageId, teamNum * 2];
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
