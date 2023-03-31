import util from "node:util";
import { log4js_obj } from "../log4js_settings";
import { DBCommon } from "./db";
import { TeamDivider } from "./model/team_divider";
const logger = log4js_obj.getLogger("database");

export class TeamDividerService {
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
  static async registeredMembersStrings(message_id: $TSFixMe) {
    const db = DBCommon.open();
    db.all = util.promisify(db.all);
    let results = (await db.all(
      `SELECT
          message_id,
          member_id,t
          member_name,
          team,
          match_num,
          joined_match_count,
          win,
          CASE WHEN force_spectate = 1 THEN true ELSE false END,
          CASE WHEN hide_win = 1 THEN true ELSE false END,
          0 as win_rate,
          created_at
      FROM
          team_divider
      WHERE
          message_id = ${message_id}
          AND match_num = 0
      ORDER BY
          created_at
      `
    )) as TeamDivider[];
    DBCommon.close();
    let usersString = '';
    for (let i = 0; i < results.length; i++) {
      const member = results[i];
      usersString = usersString + `\n${member.member_name}`;
    }
    return [usersString, results.length];
  }

  static async deleteMemberFromDB(message_id: $TSFixMe, member_id: $TSFixMe) {
    try {
      DBCommon.init();

      await DBCommon.run(
        `DELETE from team_divider where message_id = $1 and member_id = $2 and match_num = 0`,
        [message_id, member_id]
      );
      DBCommon.close();
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * DBにメンバーを登録・試合回数更新時にも使用
   * @param {*} TeamDivider
   */
  static async registerMemberToDB(teamDivider: $TSFixMe) {
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
        ]
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
  static async selectMemberFromDB(
    message_id: string,
    match_num: number,
    member_id: string
  ) {
    const db = DBCommon.open();
    db.all = util.promisify(db.all);
    let results = (await db.all(
      `SELECT
              message_id,
              member_id,
              member_name,
              team,
              match_num,
              joined_match_count,
              win,
              CASE WHEN force_spectate = 1 THEN true ELSE false END,
              CASE WHEN hide_win = 1 THEN true ELSE false END,
              0 as win_rate,
              created_at
          FROM
              team_divider
          WHERE
              message_id = ${message_id}
              AND member_id = ${member_id}
              AND match_num = ${match_num}
      `
    )) as TeamDivider[];
    DBCommon.close();
    return results;
  }

  /**
   * 特定の試合数で全メンバーを取得
   * @param {*} messageId 登録メッセージID
   * @param {*} matchNum 該当試合数
   * @returns 取得結果
   */
  static async selectAllMemberFromDB(message_id: string, match_num: number) {
    const db = DBCommon.open();
    let results = (await db.all(
      `SELECT
            message_id,
            member_id,
            member_name,
            team,
            match_num,
            joined_match_count,
            win,
            CASE WHEN force_spectate = 1 THEN true ELSE false END,
            CASE WHEN hide_win = 1 THEN true ELSE false END,
            0 as win_rate,
            created_at
        FROM
            team_divider
        WHERE
            message_id = ${message_id}
            AND match_num = ${match_num}
    `
    )) as TeamDivider[];
    DBCommon.close();
    return results;
  }

  /**
   * テーブルから該当のチーム分け情報を削除
   * @param {*} messageId 登録メッセージID
   */
  static async deleteAllMemberFromDB(message_id: $TSFixMe) {
    try {
      DBCommon.init();
      await DBCommon.run(`DELETE from team_divider where message_id = ?`, [
        message_id,
      ]);
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
  static async setTeam(
    message_id: $TSFixMe,
    member_id: $TSFixMe,
    match_num: $TSFixMe,
    team: $TSFixMe
  ) {
    try {
      DBCommon.init();
      await DBCommon.run(
        `UPDATE team_divider SET team = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`,
        [team, message_id, member_id, match_num]
      );
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
  static async setCount(
    message_id: $TSFixMe,
    member_id: $TSFixMe,
    match_num: $TSFixMe,
    count: $TSFixMe
  ) {
    try {
      DBCommon.init();

      await DBCommon.run(
        `UPDATE team_divider SET joined_match_count = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`,
        [count, message_id, member_id, match_num]
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
  static async setWin(
    message_id: $TSFixMe,
    member_id: $TSFixMe,
    match_num: $TSFixMe,
    win_count: $TSFixMe
  ) {
    try {
      DBCommon.init();
      await DBCommon.run(
        `UPDATE team_divider SET win = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`,
        [win_count, message_id, member_id, match_num]
      );
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
  static async setHideWin(message_id: $TSFixMe, flag: $TSFixMe) {
    try {
      DBCommon.init();
      await DBCommon.run(
        `UPDATE team_divider SET hide_win = $1 WHERE message_id = $2`,
        [flag ? 1 : 0, message_id]
      );
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
  static async setForceSpectate(
    message_id: $TSFixMe,
    member_id: $TSFixMe,
    match_num: $TSFixMe,
    flag: $TSFixMe
  ) {
    try {
      DBCommon.init();
      await DBCommon.run(
        `UPDATE team_divider SET force_spectate = $1 WHERE message_id = $2 and member_id = $3 and match_num = $4`,
        [flag ? 1 : 0, message_id, member_id, match_num]
      );
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
  static async getTeamMember(
    message_id: string,
    match_num: number,
    team: number
  ) {
    const db = DBCommon.open();
    db.all = util.promisify(db.all);
    let results = await db.all(
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
          message_id = ${message_id}
      and team = ${team}
      and match_num = ${match_num}
      order by
          created_at
        `
    );
    DBCommon.close();
    return results;
  }

  /**
   * 特定の試合数の観戦希望者を取得
   * @param {*} messageId 登録メッセージID
   * @param {*} matchNum 該当試合数
   * @returns 取得結果
   */
  static async getForceSpectate(message_id: string, match_num: number) {
    const db = DBCommon.open();
    let results = await db.all(
      `SELECT * FROM team_divider WHERE message_id = ${message_id} and force_spectate = true and match_num = ${match_num} order by created_at`
    );
    DBCommon.close();
    return results;
  }

  /**
   * 特定の試合数の勝率順に並べた試合参加者を取得
   * @param {*} messageId 登録メッセージID
   * @param {*} matchNum 該当試合数
   * @param {*} teamNum 1チームのメンバー数
   * @returns 取得結果
   */
  static async getParticipants(
    message_id: string,
    match_num: number,
    team_num: number
  ) {
    const db = DBCommon.open();
    let results = await db.all(
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
            and message_id = ${message_id}
            and match_num = ${match_num}
        order by
            joined_match_count
        limit ${team_num};`
    );
    DBCommon.close();
    return results;
  }

  static async getRecruitMessageByAuthorId(author_id: string) {
    const db = DBCommon.open();
    let results = await db.all(
      `select message_id from recruit where author_id = ${author_id}`
    );
    DBCommon.close();
    return results;
  }

  /**
   * 特定の試合数のデータを削除する
   * @param {*} messageId 登録メッセージID
   * @param {*} matchNum 該当試合数
   */
  static async deleteMatchingResult(message_id: $TSFixMe, match_num: $TSFixMe) {
    try {
      DBCommon.init();
      DBCommon.run(
        `DELETE from team_divider where message_id = $1 and match_num = $2`,
        [message_id, match_num]
      );
      DBCommon.close();
    } catch (err) {
      logger.error(err);
    }
  }
};