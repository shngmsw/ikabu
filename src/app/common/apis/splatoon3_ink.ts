import NodeCache from 'node-cache';
import fetch from 'node-fetch';

import { sp3Locale } from './types/locale';
import { sp3Schedule } from './types/schedule';
import { log4js_obj } from '../../../log4js_settings';
import { isDateWithinRange } from '../datetime';
import { assertExistCheck, exists, isEmpty, notExists } from '../others';
const schedule_url = 'https://splatoon3.ink/data/schedules.json';
const locale_url = 'https://splatoon3.ink/data/locale/ja-JP.json';

const logger = log4js_obj.getLogger();

const storageCache = new NodeCache();

export async function getSchedule() {
    try {
        const schedule = storageCache.get('sp3_schedule') as sp3Schedule;

        if (notExists(schedule)) {
            logger.warn('schedule data was not found. (fetch)');
            return await updateSchedule();
        }

        const regularList = getRegularList(schedule); // レギュラーの1つ目の時間でフェッチするか決定
        assertExistCheck(regularList, 'regularSchedule');
        const endDatetime = new Date(regularList[0].endTime).getTime();
        const nowDatetime = new Date().getTime();

        // スケジュールデータの終了時間よりも現在の時間が遅い場合
        if (endDatetime - nowDatetime < 0) {
            return await updateSchedule();
        } else {
            return schedule;
        }
    } catch (error) {
        logger.error(error);
    }
}

export async function getLocale() {
    try {
        const locale = storageCache.get('sp3_locale');

        if (notExists(locale)) {
            logger.warn('locale data was not found. (fetch)');
            return await updateLocale();
        }
        return locale;
    } catch (error) {
        logger.error(error);
    }
}

export async function updateLocale() {
    const locale = await fetch(locale_url);
    const localeData = await locale.json();

    storageCache.set('sp3_locale', localeData);
    logger.info('locale fetched!');
    return localeData;
}

export async function updateSchedule() {
    try {
        const schedule = await fetch(schedule_url); // スケジュール情報のfetch
        const schduleData = await schedule.json();

        storageCache.set('sp3_schedule', schduleData.data);
        logger.info('schedule fetched!');
        return schduleData.data;
    } catch (error) {
        logger.error(error);
    }
}

/**
 * フェス中かチェックする
 * @param schedule スケジュールデータ
 * @param num スケジュール番号
 * @returns フェス中ならtrueを返す
 */
export function checkFes(schedule: sp3Schedule, num: number) {
    try {
        const festList = getFesList(schedule);
        const festSetting = festList[num].festMatchSetting;
        return exists(festSetting);
    } catch (error) {
        logger.error(error);
    }
}

/**
 * ビッグラン中かチェックする
 * @param schedule スケジュールデータ
 * @param num スケジュール番号
 * @returns ビッグラン中ならtrueを返す
 */
export function checkBigRun(schedule: sp3Schedule, num: number) {
    try {
        const bigRunList = getBigRunList(schedule);

        if (bigRunList.length === 0) {
            return false;
        }

        const bigRunSetting = bigRunList[num].setting;

        if (isEmpty(bigRunSetting)) {
            return false;
        }

        const startDatetime = new Date(bigRunList[num].startTime);
        const endDatetime = new Date(bigRunList[num].endTime);
        const nowDatetime = new Date();
        return isDateWithinRange(nowDatetime, startDatetime, endDatetime);
    } catch (error) {
        logger.error(error);
    }
}

/**
 * チームコンテスト中かチェックする
 * @param schedule スケジュールデータ
 * @param num スケジュール番号
 * @returns チームコンテスト中ならtrueを返す
 */
export function checkTeamContest(schedule: sp3Schedule, num: number) {
    try {
        const teamContestList = getTeamContestList(schedule);

        if (teamContestList.length === 0) {
            return false;
        }

        const teamContestSetting = teamContestList[num].setting;

        if (isEmpty(teamContestSetting)) {
            return false;
        }

        const startDatetime = new Date(teamContestList[num].startTime).getTime();
        const endDatetime = new Date(teamContestList[num].endTime).getTime();
        const nowDatetime = new Date().getTime();
        if (nowDatetime - startDatetime < 0) {
            return false;
        } else if (endDatetime - nowDatetime < 0) {
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
 * @param schedule スケジュールデータ
 */
export function getRegularList(schedule: sp3Schedule) {
    try {
        const nodes = schedule.regularSchedules.nodes;
        const result = [];
        const nowDatetime = new Date().getTime();
        for (const node of nodes) {
            const endTime = new Date(node.endTime).getTime();
            if (endTime - nowDatetime > 0) {
                result.push(node);
            }
        }
        return result;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからバンカラ用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getAnarchyList(schedule: sp3Schedule) {
    try {
        const nodes = schedule.bankaraSchedules.nodes;
        const result = [];
        const nowDatetime = new Date().getTime();
        for (const node of nodes) {
            const endTime = new Date(node.endTime).getTime();
            if (endTime - nowDatetime > 0) {
                result.push(node);
            }
        }
        return result;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからリグマ用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getEventList(schedule: sp3Schedule) {
    try {
        return schedule.eventSchedules.nodes;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからサーモン用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getSalmonList(schedule: sp3Schedule) {
    try {
        const nodes = schedule.coopGroupingSchedule.regularSchedules.nodes;
        const result = [];
        const nowDatetime = new Date().getTime();
        for (const node of nodes) {
            const endTime = new Date(node.endTime).getTime();
            if (endTime - nowDatetime > 0) {
                result.push(node);
            }
        }
        return result;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからXマッチ用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getXMatchList(schedule: sp3Schedule) {
    try {
        const nodes = schedule.xSchedules.nodes;
        const result = [];
        const nowDatetime = new Date().getTime();
        for (const node of nodes) {
            const endTime = new Date(node.endTime).getTime();
            if (endTime - nowDatetime > 0) {
                result.push(node);
            }
        }
        return result;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからフェス用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getFesList(schedule: sp3Schedule) {
    try {
        const nodes = schedule.festSchedules.nodes;
        const result = [];
        const nowDatetime = new Date().getTime();
        for (const node of nodes) {
            const endTime = new Date(node.endTime).getTime();
            if (endTime - nowDatetime > 0) {
                result.push(node);
            }
        }
        return result;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからビッグラン用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getBigRunList(schedule: sp3Schedule) {
    try {
        return schedule.coopGroupingSchedule.bigRunSchedules.nodes;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

/**
 * dataからチームコンテスト用のリストだけ返す
 * @param schedule スケジュールデータ
 */
export function getTeamContestList(schedule: sp3Schedule) {
    try {
        return schedule.coopGroupingSchedule.teamContestSchedules.nodes;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

export type MatchInfo = {
    startTime: string;
    endTime: string;
    rule?: string;
    stage1?: string;
    stage2?: string;
    stageImage1?: string;
    stageImage2?: string;
};

/**
 * レギュラー募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getRegularData(schedule: sp3Schedule, num: number) {
    try {
        const regularList = getRegularList(schedule);

        if (regularList.length - 1 < num) {
            return null;
        }

        const regularSetting = regularList[num].regularMatchSetting;

        const result: MatchInfo = {
            startTime: regularList[num].startTime,
            endTime: regularList[num].endTime,
        };

        const locale = await getLocale();
        if (!checkFes(schedule, num) && exists(regularSetting)) {
            result.rule = await rule2txt(locale, regularSetting.vsRule.id);
            result.stage1 = await stage2txt(locale, regularSetting.vsStages[0].id);
            result.stage2 = await stage2txt(locale, regularSetting.vsStages[1].id);
            result.stageImage1 = regularSetting.vsStages[0].image.url;
            result.stageImage2 = regularSetting.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * バンカラ(チャレンジ)用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getAnarchyChallengeData(schedule: sp3Schedule, num: number) {
    try {
        const anarchyList = getAnarchyList(schedule);

        if (anarchyList.length - 1 < num) {
            return null;
        }

        const anarchySettings = anarchyList[num].bankaraMatchSettings; // aSettings[0]: Challenge

        const result: MatchInfo = {
            startTime: anarchyList[num].startTime,
            endTime: anarchyList[num].endTime,
        };

        const locale = await getLocale();
        if (!checkFes(schedule, num) && exists(anarchySettings)) {
            result.rule = await rule2txt(locale, anarchySettings[0].vsRule.id);
            result.stage1 = await stage2txt(locale, anarchySettings[0].vsStages[0].id);
            result.stage2 = await stage2txt(locale, anarchySettings[0].vsStages[1].id);
            result.stageImage1 = anarchySettings[0].vsStages[0].image.url;
            result.stageImage2 = anarchySettings[0].vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * バンカラ募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getAnarchyOpenData(schedule: sp3Schedule, num: number) {
    try {
        const anarchyList = getAnarchyList(schedule);

        if (anarchyList.length - 1 < num) {
            return null;
        }

        const anarchySettings = anarchyList[num].bankaraMatchSettings; // aSettings[1]: Open

        const result: MatchInfo = {
            startTime: anarchyList[num].startTime,
            endTime: anarchyList[num].endTime,
        };

        const locale = await getLocale();
        if (!checkFes(schedule, num) && exists(anarchySettings)) {
            result.rule = await rule2txt(locale, anarchySettings[1].vsRule.id);
            result.stage1 = await stage2txt(locale, anarchySettings[1].vsStages[0].id);
            result.stage2 = await stage2txt(locale, anarchySettings[1].vsStages[1].id);
            result.stageImage1 = anarchySettings[1].vsStages[0].image.url;
            result.stageImage2 = anarchySettings[1].vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

export type EventMatchInfo = {
    title: string;
    description: string;
    regulation: string;
    startTime: string;
    endTime: string;
    rule: string;
    stage1: string;
    stage2: string;
    stageImage1: string;
    stageImage2: string;
};

/**
 * イベントマッチ募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getEventData(schedule: sp3Schedule) {
    try {
        const eventList = getEventList(schedule);

        let targetEvent = null;
        let startTime = null;
        let endTime = null;

        for (const event of eventList) {
            for (const timePeriod of event.timePeriods) {
                if (isDateWithinRange(new Date(), new Date(timePeriod.startTime), new Date(timePeriod.endTime))) {
                    targetEvent = event;
                    startTime = timePeriod.startTime;
                    endTime = timePeriod.endTime;
                }
            }
        }

        if (notExists(targetEvent)) {
            return null;
        }

        assertExistCheck(startTime, 'eventMatchStartTime');
        assertExistCheck(endTime, 'eventMatchEndTime');

        const eventSetting = targetEvent.leagueMatchSetting;

        const locale = await getLocale();

        const eventTexts = await event2txt(locale, eventSetting.leagueMatchEvent.id);
        assertExistCheck(eventTexts);

        const result: EventMatchInfo = {
            title: eventTexts.title,
            description: eventTexts.description,
            regulation: eventTexts.regulation,
            startTime: startTime,
            endTime: endTime,
            rule: await rule2txt(locale, eventSetting.vsRule.id),
            stage1: await stage2txt(locale, eventSetting.vsStages[0].id),
            stage2: await stage2txt(locale, eventSetting.vsStages[1].id),
            stageImage1: eventSetting.vsStages[0].image.url,
            stageImage2: eventSetting.vsStages[1].image.url,
        };

        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

export type SalmonInfo = {
    startTime: string;
    endTime: string;
    stage: string;
    weapon1: string;
    weapon2: string;
    weapon3: string;
    weapon4: string;
    stageImage: string;
};

/**
 * サーモン募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getSalmonData(schedule: sp3Schedule, num: number) {
    try {
        const salmonList = getSalmonList(schedule);

        if (salmonList.length - 1 < num) {
            return null;
        }

        const salmonSetting = salmonList[num].setting;

        const locale = await getLocale();
        const result: SalmonInfo = {
            startTime: salmonList[num].startTime,
            endTime: salmonList[num].endTime,
            stage: await stage2txt(locale, salmonSetting.coopStage.id),
            weapon1: salmonSetting.weapons[0].image.url,
            weapon2: salmonSetting.weapons[1].image.url,
            weapon3: salmonSetting.weapons[2].image.url,
            weapon4: salmonSetting.weapons[3].image.url,
            stageImage: salmonSetting.coopStage.thumbnailImage.url,
        };

        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * Xマッチ用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getXMatchData(schedule: sp3Schedule, num: number) {
    try {
        const xMatchList = getXMatchList(schedule);

        if (xMatchList.length - 1 < num) {
            return null;
        }

        const xMatchSettings = xMatchList[num].xMatchSetting;

        const result: MatchInfo = {
            startTime: xMatchList[num].startTime,
            endTime: xMatchList[num].endTime,
        };

        const locale = await getLocale();
        if (!checkFes(schedule, num) && exists(xMatchSettings)) {
            result.rule = await rule2txt(locale, xMatchSettings.vsRule.id);
            result.stage1 = await stage2txt(locale, xMatchSettings.vsStages[0].id);
            result.stage2 = await stage2txt(locale, xMatchSettings.vsStages[1].id);
            result.stageImage1 = xMatchSettings.vsStages[0].image.url;
            result.stageImage2 = xMatchSettings.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * フェス募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getFesData(schedule: sp3Schedule, num: number) {
    try {
        const festList = getFesList(schedule);

        if (festList.length - 1 < num) {
            return null;
        }

        const festSetting = festList[num].festMatchSetting;

        const result: MatchInfo = {
            startTime: festList[num].startTime,
            endTime: festList[num].endTime,
        };

        const locale = await getLocale();
        if (checkFes(schedule, num) && exists(festSetting)) {
            result.rule = await rule2txt(locale, festSetting.vsRule.id);
            result.stage1 = await stage2txt(locale, festSetting.vsStages[0].id);
            result.stage2 = await stage2txt(locale, festSetting.vsStages[1].id);
            result.stageImage1 = festSetting.vsStages[0].image.url;
            result.stageImage2 = festSetting.vsStages[1].image.url;
        }
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * ビッグラン募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getBigRunData(schedule: sp3Schedule, num: number) {
    try {
        const bigRunList = getBigRunList(schedule);
        const bigRunSetting = bigRunList[num].setting;

        const locale = await getLocale();
        const result: SalmonInfo = {
            startTime: bigRunList[num].startTime,
            endTime: bigRunList[num].endTime,
            stage: await stage2txt(locale, bigRunSetting.coopStage.id),
            weapon1: bigRunSetting.weapons[0].image.url,
            weapon2: bigRunSetting.weapons[1].image.url,
            weapon3: bigRunSetting.weapons[2].image.url,
            weapon4: bigRunSetting.weapons[3].image.url,
            stageImage: bigRunSetting.coopStage.thumbnailImage.url,
        };
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * チームコンテスト募集用データに整形する
 * @param schedule フェッチしたデータ
 * @param num スケジュール番号
 * @returns 連想配列で返す
 */
export async function getTeamContestData(schedule: sp3Schedule, num: number) {
    try {
        const teamContestList = getTeamContestList(schedule);
        const teamContestSetting = teamContestList[num].setting;

        const locale = await getLocale();
        const result: SalmonInfo = {
            startTime: teamContestList[num].startTime,
            endTime: teamContestList[num].endTime,
            stage: await stage2txt(locale, teamContestSetting.coopStage.id),
            weapon1: teamContestSetting.weapons[0].image.url,
            weapon2: teamContestSetting.weapons[1].image.url,
            weapon3: teamContestSetting.weapons[2].image.url,
            weapon4: teamContestSetting.weapons[3].image.url,
            stageImage: teamContestSetting.coopStage.thumbnailImage.url,
        };
        return result;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

/**
 * localeをもとにIDをステージ名に変換
 * @param locale ロケールデータ
 * @param id 変換するID
 * @returns ステージ名
 */
export async function stage2txt(locale: sp3Locale, id: string, fetch = true): Promise<string> {
    try {
        const stages = locale.stages;
        if (notExists(stages[id])) {
            if (fetch) {
                const fetchedLocale = await updateLocale();
                return await stage2txt(fetchedLocale, id, false);
            } else {
                return 'そーりー・あんでふぁいんど';
            }
        } else {
            return stages[id].name;
        }
    } catch (error) {
        logger.error(error);
        return 'そーりー・あんでふぁいんど';
    }
}

/**
 * localeをもとにIDをルール名に変換
 * @param locale ロケールデータ
 * @param id 変換するID
 * @returns ルール名
 */
export async function rule2txt(locale: sp3Locale, id: string, fetch = true): Promise<string> {
    try {
        const rules = locale.rules;
        if (notExists(rules[id])) {
            if (fetch) {
                const fetchedLocale = await updateLocale();
                return await rule2txt(fetchedLocale, id, false);
            } else {
                return 'そーりー・あんでふぁいんど';
            }
        } else {
            return rules[id].name;
        }
    } catch (error) {
        logger.error(error);
        return 'そーりー・あんでふぁいんど';
    }
}

async function event2txt(locale: sp3Locale, id: string, fetch = true): Promise<{ title: string; description: string; regulation: string }> {
    try {
        const result = {
            title: 'そーりー・あんでふぁいんど',
            description: 'そーりー・あんでふぁいんど',
            regulation: 'そーりー・あんでふぁいんど',
        };

        const events = locale.events;

        if (notExists(events[id])) {
            if (fetch) {
                const fetchedLocale = await updateLocale();
                return await event2txt(fetchedLocale, id, false);
            } else {
                return result;
            }
        } else {
            result.title = events[id].name;
            result.description = events[id].desc;
            result.regulation = events[id].regulation;
            return result;
        }
    } catch (error) {
        logger.error(error);
        return {
            title: 'そーりー・あんでふぁいんど',
            description: 'そーりー・あんでふぁいんど',
            regulation: 'そーりー・あんでふぁいんど',
        };
    }
}
