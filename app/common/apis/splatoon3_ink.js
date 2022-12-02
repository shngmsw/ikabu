const fetch = require('node-fetch');
const log4js = require('log4js');
const { unixTime2hm, unixTime2mdwhm, unixTime2ymdw } = require('../../common');

const schedule_url = 'https://splatoon3.ink/data/schedules.json';
const locale_url = 'https://splatoon3.ink/data/locale/ja-JP.json';

module.exports = {
    fetchSchedule: fetchSchedule,
    checkFes: checkFes,
    getRegularList: getRegularList,
    getAnarchyList: getAnarchyList,
    getSalmonList: getSalmonList,
    getFesList: getFesList,
    getRegularRecruitData: getRegularRecruitData,
    getAnarchyRecruitData: getAnarchyRecruitData,
    getSalmonRecruitData: getSalmonRecruitData,
    getFesRecruitData: getFesRecruitData,
};

const logger = log4js.getLogger('api');

async function fetchSchedule() {
    try {
        const response = await fetch(schedule_url);
        const data = await response.json();
        return data;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * フェス中かチェックする
 * @param {*} data スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns フェス中ならtrueを返す
 */
function checkFes(data, num) {
    try {
        const fest_list = data.data.festSchedules.nodes;
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
 * @param {*} data スケジュールデータ
 */
function getRegularList(data) {
    try {
        return data.data.regularSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからバンカラ用のリストだけ返す
 * @param {*} data スケジュールデータ
 */
function getAnarchyList(data) {
    try {
        return data.data.bankaraSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからサーモン用のリストだけ返す
 * @param {*} data スケジュールデータ
 */
function getSalmonList(data) {
    try {
        return data.data.coopGroupingSchedule.regularSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * dataからフェス用のリストだけ返す
 * @param {*} data スケジュールデータ
 */
function getFesList(data) {
    try {
        return data.data.festSchedules.nodes;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * レギュラー募集用データに整形する
 * @param {*} data スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getRegularRecruitData(data, num) {
    try {
        const regular_list = getRegularList(data);
        const r_setting = regular_list[num].regularMatchSetting;

        result = {};
        result.date = unixTime2ymdw(regular_list[num].startTime);
        result.time = unixTime2hm(regular_list[num].startTime) + ' – ' + unixTime2hm(regular_list[num].endTime);
        result.rule = await rule2txt(r_setting.vsRule.id);
        result.stage1 = await stage2txt(r_setting.vsStages[0].id);
        result.stage2 = await stage2txt(r_setting.vsStages[1].id);
        result.stageImage1 = r_setting.vsStages[0].image.url;
        result.stageImage2 = r_setting.vsStages[1].image.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * バンカラ募集用データに整形する
 * @param {*} data スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getAnarchyRecruitData(data, num) {
    try {
        const anarchy_list = getAnarchyList(data);
        const a_settings = anarchy_list[num].bankaraMatchSettings; // 0: Challenge, 1: Open

        let result = {};
        result.date = unixTime2ymdw(anarchy_list[num].startTime);
        result.time = unixTime2hm(anarchy_list[num].startTime) + ' – ' + unixTime2hm(anarchy_list[num].endTime);
        result.rule = await rule2txt(a_settings[1].vsRule.id);
        result.stage1 = await stage2txt(a_settings[1].vsStages[0].id);
        result.stage2 = await stage2txt(a_settings[1].vsStages[1].id);
        result.stageImage1 = a_settings[1].vsStages[0].image.url;
        result.stageImage2 = a_settings[1].vsStages[1].image.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * サーモン募集用データに整形する
 * @param {*} data スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getSalmonRecruitData(data, num) {
    try {
        const salmon_list = getSalmonList(data);
        const c_setting = salmon_list[num].setting;

        let result = {};
        result.date = unixTime2mdwhm(salmon_list[num].startTime) + ' – ' + unixTime2mdwhm(salmon_list[num].endTime);
        result.stage = await stage2txt(c_setting.coopStage.id);
        result.weapon1 = c_setting.weapons[0].image.url;
        result.weapon2 = c_setting.weapons[1].image.url;
        result.weapon3 = c_setting.weapons[2].image.url;
        result.weapon4 = c_setting.weapons[3].image.url;
        result.stageImage = c_setting.coopStage.thumbnailImage.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * フェス募集用データに整形する
 * @param {*} data スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getFesRecruitData(data, num) {
    try {
        const fes_list = getFesList(data);
        const f_setting = fes_list[num].festMatchSetting;

        let result = {};
        result.date = unixTime2ymdw(fes_list[num].startTime);
        result.time = unixTime2hm(fes_list[num].startTime) + ' – ' + unixTime2hm(fes_list[num].endTime);
        result.rule = await rule2txt(f_setting.vsRule.id);
        result.stage1 = await stage2txt(f_setting.vsStages[0].id);
        result.stage2 = await stage2txt(f_setting.vsStages[1].id);
        result.stageImage1 = f_setting.vsStages[0].image.url;
        result.stageImage2 = f_setting.vsStages[1].image.url;
        return result;
    } catch (error) {
        logger.error(error);
    }
}

async function stage2txt(id) {
    try {
        const response = await fetch(locale_url);
        const data = await response.json();
        const stages = data.stages;
        return stages[id].name;
    } catch (error) {
        logger.error(error);
    }
}

async function rule2txt(id) {
    try {
        const response = await fetch(locale_url);
        const data = await response.json();
        const rules = data.rules;
        return rules[id].name;
    } catch (error) {
        logger.error(error);
    }
}
