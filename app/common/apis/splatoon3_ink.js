const fetch = require('node-fetch');
const log4js = require('log4js');
const { isEmpty } = require('../../common');
const schedule_url = 'https://splatoon3.ink/data/schedules.json';
const locale_url = 'https://splatoon3.ink/data/locale/ja-JP.json';

module.exports = {
    fetchSchedule: fetchSchedule,
    checkFes: checkFes,
    getRegularList: getRegularList,
    getAnarchyList: getAnarchyList,
    getLeagueList: getLeagueList,
    getSalmonList: getSalmonList,
    getXMatchList: getXMatchList,
    getFesList: getFesList,
    getRegularData: getRegularData,
    getAnarchyChallengeData: getAnarchyChallengeData,
    getAnarchyOpenData: getAnarchyOpenData,
    getLeagueData: getLeagueData,
    getSalmonData: getSalmonData,
    getXMatchData: getXMatchData,
    getFesData: getFesData,
};

const logger = log4js.getLogger('api');

async function fetchSchedule() {
    try {
        const schedule = await fetch(schedule_url); // スケジュール情報のfetch
        const schedule_data = await schedule.json();
        const locale = await fetch(locale_url); // 名前解決のためのlocale情報のfetch
        const locale_data = await locale.json();
        const result_data = { schedule: schedule_data, locale: locale_data }; // dataを一つにまとめる
        return result_data;
    } catch (error) {
        logger.error(result_data);
    }
}

/**
 * フェス中かチェックする
 * @param {*} schedule スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns フェス中ならtrueを返す
 */
function checkFes(schedule, num) {
    try {
        const fest_list = schedule.data.festSchedules.nodes;
        const f_setting = fest_list[num].festMatchSetting;
        if (f_setting == null) {
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
function getRegularList(schedule) {
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
function getAnarchyList(schedule) {
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
function getLeagueList(schedule) {
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
function getSalmonList(schedule) {
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
function getXMatchList(schedule) {
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
function getFesList(schedule) {
    try {
        return schedule.data.festSchedules.nodes;
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
async function getRegularData(data, num) {
    try {
        const regular_list = getRegularList(data.schedule);
        const r_setting = regular_list[num].regularMatchSetting;

        result = {};
        result.startTime = regular_list[num].startTime;
        result.endTime = regular_list[num].endTime;
        result.rule = await rule2txt(data.locale, r_setting.vsRule.id);
        result.stage1 = await stage2txt(data.locale, r_setting.vsStages[0].id);
        result.stage2 = await stage2txt(data.locale, r_setting.vsStages[1].id);
        result.stageImage1 = r_setting.vsStages[0].image.url;
        result.stageImage2 = r_setting.vsStages[1].image.url;
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
async function getAnarchyChallengeData(data, num) {
    try {
        const anarchy_list = getAnarchyList(data.schedule);
        const a_settings = anarchy_list[num].bankaraMatchSettings; // a_settings[0]: Challenge

        let result = {};
        result.startTime = anarchy_list[num].startTime;
        result.endTime = anarchy_list[num].endTime;
        result.rule = await rule2txt(data.locale, a_settings[0].vsRule.id);
        result.stage1 = await stage2txt(data.locale, a_settings[0].vsStages[0].id);
        result.stage2 = await stage2txt(data.locale, a_settings[0].vsStages[1].id);
        result.stageImage1 = a_settings[0].vsStages[0].image.url;
        result.stageImage2 = a_settings[0].vsStages[1].image.url;
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
async function getAnarchyOpenData(data, num) {
    try {
        const anarchy_list = getAnarchyList(data.schedule);
        const a_settings = anarchy_list[num].bankaraMatchSettings; // a_settings[1]: Open

        let result = {};
        result.startTime = anarchy_list[num].startTime;
        result.endTime = anarchy_list[num].endTime;
        result.rule = await rule2txt(data.locale, a_settings[1].vsRule.id);
        result.stage1 = await stage2txt(data.locale, a_settings[1].vsStages[0].id);
        result.stage2 = await stage2txt(data.locale, a_settings[1].vsStages[1].id);
        result.stageImage1 = a_settings[1].vsStages[0].image.url;
        result.stageImage2 = a_settings[1].vsStages[1].image.url;
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
async function getLeagueData(data, num) {
    try {
        const league_list = getLeagueList(data.schedule);
        const l_settings = league_list[num].leagueMatchSetting;

        let result = {};
        result.startTime = league_list[num].startTime;
        result.endTime = league_list[num].endTime;
        result.rule = await rule2txt(data.locale, l_settings.vsRule.id);
        result.stage1 = await stage2txt(data.locale, l_settings.vsStages[0].id);
        result.stage2 = await stage2txt(data.locale, l_settings.vsStages[1].id);
        result.stageImage1 = l_settings.vsStages[0].image.url;
        result.stageImage2 = l_settings.vsStages[1].image.url;
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
async function getSalmonData(data, num) {
    try {
        const salmon_list = getSalmonList(data.schedule);
        const s_setting = salmon_list[num].setting;

        let result = {};
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
async function getXMatchData(data, num) {
    try {
        const x_list = getXMatchList(data.schedule);
        const x_settings = x_list[num].xMatchSetting;

        let result = {};
        result.startTime = x_list[num].startTime;
        result.endTime = x_list[num].endTime;
        result.rule = await rule2txt(data.locale, x_settings.vsRule.id);
        result.stage1 = await stage2txt(data.locale, x_settings.vsStages[0].id);
        result.stage2 = await stage2txt(data.locale, x_settings.vsStages[1].id);
        result.stageImage1 = x_settings.vsStages[0].image.url;
        result.stageImage2 = x_settings.vsStages[1].image.url;
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
async function getFesData(data, num) {
    try {
        const fes_list = getFesList(data.schedule);
        const f_setting = fes_list[num].festMatchSetting;

        let result = {};
        result.startTime = fes_list[num].startTime;
        result.endTime = fes_list[num].endTime;
        result.rule = await rule2txt(data.locale, f_setting.vsRule.id);
        result.stage1 = await stage2txt(data.locale, f_setting.vsStages[0].id);
        result.stage2 = await stage2txt(data.locale, f_setting.vsStages[1].id);
        result.stageImage1 = f_setting.vsStages[0].image.url;
        result.stageImage2 = f_setting.vsStages[1].image.url;
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
async function stage2txt(locale, id) {
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
async function rule2txt(locale, id) {
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
