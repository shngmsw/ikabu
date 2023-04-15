import fetch from 'node-fetch';
import { log4js_obj } from '../../../log4js_settings';
import { isEmpty } from '../others';
const schedule_url = 'https://splatoon3.ink/data/schedules.json';
const locale_url = 'https://splatoon3.ink/data/locale/ja-JP.json';

const logger = log4js_obj.getLogger();

export async function fetchSchedule() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result_data = (globalThis as any).schedule_data;

        if (isEmpty(result_data)) {
            logger.warn('schedule data was not found. (fetch)');
            return await updateSchedule();
        }

        const regular_list = getRegularList(result_data.schedule); // レギュラーの1つ目の時間でフェッチするか決定
        const end_datetime = new Date(regular_list[0].endTime).getTime();
        const now_datetime = new Date().getTime();

        // スケジュールデータの終了時間よりも現在の時間が遅い場合
        if (end_datetime - now_datetime < 0) {
            return await updateSchedule();
        } else {
            return result_data;
        }
    } catch (error) {
        logger.error(error);
    }
}

export async function updateSchedule() {
    try {
        const schedule = await fetch(schedule_url); // スケジュール情報のfetch
        const schedule_data = await schedule.json();
        const locale = await fetch(locale_url); // 名前解決のためのlocale情報のfetch
        const locale_data = await locale.json();
        const result_data = { schedule: schedule_data, locale: locale_data }; // dataを一つにまとめる
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).schedule_data = result_data;
        logger.info('schedule fetched!');
        return result_data;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * フェス中かチェックする
 * @param {*} schedule スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns フェス中ならtrueを返す
 */
export function checkFes(schedule: $TSFixMe, num: $TSFixMe) {
    try {
        const fest_list = getFesList(schedule);
        const f_setting = fest_list[num].festMatchSetting;
        if (isEmpty(f_setting)) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * ビッグラン中かチェックする
 * @param {*} schedule スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns ビッグラン中ならtrueを返す
 */
export function checkBigRun(schedule: $TSFixMe, num: $TSFixMe) {
    try {
        const big_run_list = getBigRunList(schedule);

        if (big_run_list.length == 0) {
            return false;
        }

        const b_setting = big_run_list[num].setting;

        if (isEmpty(b_setting)) {
            return false;
        }

        const start_datetime = new Date(big_run_list[num].startTime).getTime();
        const end_datetime = new Date(big_run_list[num].endTime).getTime();
        const now_datetime = new Date().getTime();
        if (now_datetime - start_datetime < 0) {
            return false;
        } else if (end_datetime - now_datetime < 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * チームコンテスト中かチェックする
 * @param {*} schedule スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns チームコンテスト中ならtrueを返す
 */
export function checkTeamContest(schedule: $TSFixMe, num: $TSFixMe) {
    try {
        const teamContestList = getTeamContestList(schedule);

        if (teamContestList.length == 0) {
            return false;
        }

        const t_setting = teamContestList[num].setting;

        if (isEmpty(t_setting)) {
            return false;
        }

        const start_datetime = new Date(teamContestList[num].startTime).getTime();
        const end_datetime = new Date(teamContestList[num].endTime).getTime();
        const now_datetime = new Date().getTime();
        if (now_datetime - start_datetime < 0) {
            return false;
        } else if (end_datetime - now_datetime < 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからレギュラー用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getRegularList(schedule: $TSFixMe) {
    try {
        return schedule.data.regularSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからバンカラ用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getAnarchyList(schedule: $TSFixMe) {
    try {
        return schedule.data.bankaraSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからリグマ用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getLeagueList(schedule: $TSFixMe) {
    try {
        return schedule.data.leagueSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからサーモン用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getSalmonList(schedule: $TSFixMe) {
    try {
        return schedule.data.coopGroupingSchedule.regularSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからXマッチ用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getXMatchList(schedule: $TSFixMe) {
    try {
        return schedule.data.xSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからフェス用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getFesList(schedule: $TSFixMe) {
    try {
        return schedule.data.festSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからビッグラン用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getBigRunList(schedule: $TSFixMe) {
    try {
        return schedule.data.coopGroupingSchedule.bigRunSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからチームコンテスト用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
export function getTeamContestList(schedule: $TSFixMe) {
    try {
        return schedule.data.coopGroupingSchedule.teamContestSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * レギュラー募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getRegularData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const regular_list = getRegularList(data.schedule);
        const r_setting = regular_list[num].regularMatchSetting;

        const result: $TSFixMe = {};
        result.startTime = regular_list[num].startTime;
        result.endTime = regular_list[num].endTime;
        if (!checkFes(data.schedule, num)) {
            result.rule = await rule2txt(data.locale, r_setting.vsRule.id);
            result.stage1 = await stage2txt(data.locale, r_setting.vsStages[0].id);
            result.stage2 = await stage2txt(data.locale, r_setting.vsStages[1].id);
            result.stageImage1 = r_setting.vsStages[0].image.url;
            result.stageImage2 = r_setting.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * バンカラ(チャレンジ)用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getAnarchyChallengeData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const anarchy_list = getAnarchyList(data.schedule);
        const a_settings = anarchy_list[num].bankaraMatchSettings; // a_settings[0]: Challenge

        const result: $TSFixMe = {};
        result.startTime = anarchy_list[num].startTime;
        result.endTime = anarchy_list[num].endTime;
        if (!checkFes(data.schedule, num)) {
            result.rule = await rule2txt(data.locale, a_settings[0].vsRule.id);
            result.stage1 = await stage2txt(data.locale, a_settings[0].vsStages[0].id);
            result.stage2 = await stage2txt(data.locale, a_settings[0].vsStages[1].id);
            result.stageImage1 = a_settings[0].vsStages[0].image.url;
            result.stageImage2 = a_settings[0].vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * バンカラ募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getAnarchyOpenData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const anarchy_list = getAnarchyList(data.schedule);
        const a_settings = anarchy_list[num].bankaraMatchSettings; // a_settings[1]: Open

        const result: $TSFixMe = {};
        result.startTime = anarchy_list[num].startTime;
        result.endTime = anarchy_list[num].endTime;
        if (!checkFes(data.schedule, num)) {
            result.rule = await rule2txt(data.locale, a_settings[1].vsRule.id);
            result.stage1 = await stage2txt(data.locale, a_settings[1].vsStages[0].id);
            result.stage2 = await stage2txt(data.locale, a_settings[1].vsStages[1].id);
            result.stageImage1 = a_settings[1].vsStages[0].image.url;
            result.stageImage2 = a_settings[1].vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * リグマ募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getLeagueData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const league_list = getLeagueList(data.schedule);
        const l_settings = league_list[num].leagueMatchSetting;

        const result: $TSFixMe = {};
        result.startTime = league_list[num].startTime;
        result.endTime = league_list[num].endTime;
        if (!checkFes(data.schedule, num)) {
            result.rule = await rule2txt(data.locale, l_settings.vsRule.id);
            result.stage1 = await stage2txt(data.locale, l_settings.vsStages[0].id);
            result.stage2 = await stage2txt(data.locale, l_settings.vsStages[1].id);
            result.stageImage1 = l_settings.vsStages[0].image.url;
            result.stageImage2 = l_settings.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * サーモン募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getSalmonData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const salmon_list = getSalmonList(data.schedule);
        const s_setting = salmon_list[num].setting;

        const result: $TSFixMe = {};
        result.startTime = salmon_list[num].startTime;
        result.endTime = salmon_list[num].endTime;
        result.stage = await stage2txt(data.locale, s_setting.coopStage.id);
        result.weapon1 = s_setting.weapons[0].image.url;
        result.weapon2 = s_setting.weapons[1].image.url;
        result.weapon3 = s_setting.weapons[2].image.url;
        result.weapon4 = s_setting.weapons[3].image.url;
        result.stageImage = s_setting.coopStage.thumbnailImage.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * Xマッチ用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getXMatchData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const x_list = getXMatchList(data.schedule);
        const x_settings = x_list[num].xMatchSetting;

        const result: $TSFixMe = {};
        result.startTime = x_list[num].startTime;
        result.endTime = x_list[num].endTime;
        if (!checkFes(data.schedule, num)) {
            result.rule = await rule2txt(data.locale, x_settings.vsRule.id);
            result.stage1 = await stage2txt(data.locale, x_settings.vsStages[0].id);
            result.stage2 = await stage2txt(data.locale, x_settings.vsStages[1].id);
            result.stageImage1 = x_settings.vsStages[0].image.url;
            result.stageImage2 = x_settings.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * フェス募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getFesData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const fes_list = getFesList(data.schedule);
        const f_setting = fes_list[num].festMatchSetting;

        const result: $TSFixMe = {};
        result.startTime = fes_list[num].startTime;
        result.endTime = fes_list[num].endTime;
        if (checkFes(data.schedule, num)) {
            result.rule = await rule2txt(data.locale, f_setting.vsRule.id);
            result.stage1 = await stage2txt(data.locale, f_setting.vsStages[0].id);
            result.stage2 = await stage2txt(data.locale, f_setting.vsStages[1].id);
            result.stageImage1 = f_setting.vsStages[0].image.url;
            result.stageImage2 = f_setting.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * ビッグラン募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getBigRunData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const big_run_list = getBigRunList(data.schedule);
        const b_setting = big_run_list[num].setting;

        const result: $TSFixMe = {};
        result.startTime = big_run_list[num].startTime;
        result.endTime = big_run_list[num].endTime;
        result.stage = await stage2txt(data.locale, b_setting.coopStage.id);
        result.weapon1 = b_setting.weapons[0].image.url;
        result.weapon2 = b_setting.weapons[1].image.url;
        result.weapon3 = b_setting.weapons[2].image.url;
        result.weapon4 = b_setting.weapons[3].image.url;
        result.stageImage = b_setting.coopStage.thumbnailImage.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * チームコンテスト募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getTeamContestData(data: $TSFixMe, num: $TSFixMe) {
    try {
        const teamContestList = getTeamContestList(data.schedule);
        const t_setting = teamContestList[num].setting;

        const result: $TSFixMe = {};
        result.startTime = teamContestList[num].startTime;
        result.endTime = teamContestList[num].endTime;
        result.stage = await stage2txt(data.locale, t_setting.coopStage.id);
        result.weapon1 = t_setting.weapons[0].image.url;
        result.weapon2 = t_setting.weapons[1].image.url;
        result.weapon3 = t_setting.weapons[2].image.url;
        result.weapon4 = t_setting.weapons[3].image.url;
        result.stageImage = t_setting.coopStage.thumbnailImage.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * localeをもとにIDをステージ名に変換
 * @param {*} locale ロケールデータ
 * @param {*} id 変換するID
 * @returns ステージ名
 */
export async function stage2txt(locale: $TSFixMe, id: $TSFixMe) {
    try {
        const stages = locale.stages;
        if (isEmpty(stages[id])) {
            return 'そーりー・あんでふぁいんど';
        } else {
            return stages[id].name;
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * localeをもとにIDをルール名に変換
 * @param {*} locale ロケールデータ
 * @param {*} id 変換するID
 * @returns ルール名
 */
export async function rule2txt(locale: $TSFixMe, id: $TSFixMe) {
    try {
        const rules = locale.rules;
        if (isEmpty(rules[id])) {
            return 'そーりー・あんでふぁいんど';
        } else {
            return rules[id].name;
        }
    } catch (error) {
        logger.error(error);
    }
}
