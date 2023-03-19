// @ts-expect-error TS(6200): Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const fetch = require('node-fetch')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log4js'.
const log4js = require('log4js')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isEmpty'.
const { isEmpty } = require('../others')
const schedule_url = 'https://splatoon3.ink/data/schedules.json'
const locale_url = 'https://splatoon3.ink/data/locale/ja-JP.json'

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
  fetchSchedule,
  updateSchedule,
  checkFes,
  checkBigRun,
  getRegularList,
  getAnarchyList,
  getLeagueList,
  getSalmonList,
  getXMatchList,
  getFesList,
  getBigRunList,
  getRegularData,
  getAnarchyChallengeData,
  getAnarchyOpenData,
  getLeagueData,
  getSalmonData,
  getXMatchData,
  getFesData,
  getBigRunData
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'logger'.
const logger = log4js.getLogger('api')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fetchSched... Remove this comment to see the full error message
async function fetchSchedule () {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'global'.
    const result_data = global.schedule_data

    if (isEmpty(result_data)) {
      logger.warn('schedule data was not found. (fetch)')
      return await updateSchedule()
    }

    const regular_list = getRegularList(result_data.schedule) // レギュラーの1つ目の時間でフェッチするか決定
    const end_datetime = new Date(regular_list[0].endTime)
    const now_datetime = new Date()

    // スケジュールデータの終了時間よりも現在の時間が遅い場合
    // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    if (end_datetime - now_datetime < 0) {
      return await updateSchedule()
    } else {
      return result_data
    }
  } catch (error) {
    logger.error(error)
  }
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'updateSche... Remove this comment to see the full error message
async function updateSchedule () {
  try {
    const schedule = await fetch(schedule_url) // スケジュール情報のfetch
    const schedule_data = await schedule.json()
    const locale = await fetch(locale_url) // 名前解決のためのlocale情報のfetch
    const locale_data = await locale.json()
    const result_data = { schedule: schedule_data, locale: locale_data } // dataを一つにまとめる
    // @ts-expect-error TS(2304): Cannot find name 'global'.
    global.schedule_data = result_data
    logger.info('schedule fetched!')
    return result_data
  } catch (error) {
    logger.error(error)
  }
}

/**
 * フェス中かチェックする
 * @param {*} schedule スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns フェス中ならtrueを返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'checkFes'.
function checkFes (schedule: $TSFixMe, num: $TSFixMe) {
  try {
    const fest_list = getFesList(schedule)
    const f_setting = fest_list[num].festMatchSetting
    if (isEmpty(f_setting)) {
      return false
    } else {
      return true
    }
  } catch (error) {
    logger.error(error)
  }
}

/**
 * ビッグラン中かチェックする
 * @param {*} schedule スケジュールデータ
 * @param {Number} num スケジュール番号
 * @returns ビッグラン中ならtrueを返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'checkBigRu... Remove this comment to see the full error message
function checkBigRun (schedule: $TSFixMe, num: $TSFixMe) {
  try {
    const big_run_list = getBigRunList(schedule)

    if (big_run_list.length == 0) {
      return false
    }

    const b_setting = big_run_list[num].setting

    if (isEmpty(b_setting)) {
      return false
    }

    const start_datetime = new Date(big_run_list[num].startTime)
    const end_datetime = new Date(big_run_list[num].endTime)
    const now_datetime = new Date()
    // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    if (now_datetime - start_datetime < 0) {
      return false
    // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    } else if (end_datetime - now_datetime < 0) {
      return false
    } else {
      return true
    }
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからレギュラー用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getRegularList (schedule: $TSFixMe) {
  try {
    return schedule.data.regularSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからバンカラ用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getAnarchyList (schedule: $TSFixMe) {
  try {
    return schedule.data.bankaraSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからリグマ用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getLeagueList (schedule: $TSFixMe) {
  try {
    return schedule.data.leagueSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからサーモン用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getSalmonList (schedule: $TSFixMe) {
  try {
    return schedule.data.coopGroupingSchedule.regularSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからXマッチ用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getXMatchList (schedule: $TSFixMe) {
  try {
    return schedule.data.xSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからフェス用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getFesList (schedule: $TSFixMe) {
  try {
    return schedule.data.festSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * dataからビッグラン用のリストだけ返す
 * @param {*} schedule スケジュールデータ
 */
function getBigRunList (schedule: $TSFixMe) {
  try {
    return schedule.data.coopGroupingSchedule.bigRunSchedules.nodes
  } catch (error) {
    logger.error(error)
  }
}

/**
 * レギュラー募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getRegular... Remove this comment to see the full error message
async function getRegularData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const regular_list = getRegularList(data.schedule)
    const r_setting = regular_list[num].regularMatchSetting

    // @ts-expect-error TS(2552): Cannot find name 'result'. Did you mean 'rest'?
    result = {}
    // @ts-expect-error TS(2552): Cannot find name 'result'. Did you mean 'rest'?
    result.startTime = regular_list[num].startTime
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    result.endTime = regular_list[num].endTime
    if (!checkFes(data.schedule, num)) {
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result.rule = await rule2txt(data.locale, r_setting.vsRule.id)
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result.stage1 = await stage2txt(data.locale, r_setting.vsStages[0].id)
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result.stage2 = await stage2txt(data.locale, r_setting.vsStages[1].id)
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result.stageImage1 = r_setting.vsStages[0].image.url
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result.stageImage2 = r_setting.vsStages[1].image.url
    }
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * バンカラ(チャレンジ)用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getAnarchyChallengeData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const anarchy_list = getAnarchyList(data.schedule)
    const a_settings = anarchy_list[num].bankaraMatchSettings // a_settings[0]: Challenge

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = anarchy_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = anarchy_list[num].endTime
    if (!checkFes(data.schedule, num)) {
      // @ts-expect-error TS(2339): Property 'rule' does not exist on type '{}'.
      result.rule = await rule2txt(data.locale, a_settings[0].vsRule.id)
      // @ts-expect-error TS(2339): Property 'stage1' does not exist on type '{}'.
      result.stage1 = await stage2txt(data.locale, a_settings[0].vsStages[0].id)
      // @ts-expect-error TS(2339): Property 'stage2' does not exist on type '{}'.
      result.stage2 = await stage2txt(data.locale, a_settings[0].vsStages[1].id)
      // @ts-expect-error TS(2339): Property 'stageImage1' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage1 = a_settings[0].vsStages[0].image.url
      // @ts-expect-error TS(2339): Property 'stageImage2' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage2 = a_settings[0].vsStages[1].image.url
    }
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * バンカラ募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getAnarchy... Remove this comment to see the full error message
async function getAnarchyOpenData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const anarchy_list = getAnarchyList(data.schedule)
    const a_settings = anarchy_list[num].bankaraMatchSettings // a_settings[1]: Open

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = anarchy_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = anarchy_list[num].endTime
    if (!checkFes(data.schedule, num)) {
      // @ts-expect-error TS(2339): Property 'rule' does not exist on type '{}'.
      result.rule = await rule2txt(data.locale, a_settings[1].vsRule.id)
      // @ts-expect-error TS(2339): Property 'stage1' does not exist on type '{}'.
      result.stage1 = await stage2txt(data.locale, a_settings[1].vsStages[0].id)
      // @ts-expect-error TS(2339): Property 'stage2' does not exist on type '{}'.
      result.stage2 = await stage2txt(data.locale, a_settings[1].vsStages[1].id)
      // @ts-expect-error TS(2339): Property 'stageImage1' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage1 = a_settings[1].vsStages[0].image.url
      // @ts-expect-error TS(2339): Property 'stageImage2' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage2 = a_settings[1].vsStages[1].image.url
    }
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * リグマ募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getLeagueData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const league_list = getLeagueList(data.schedule)
    const l_settings = league_list[num].leagueMatchSetting

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = league_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = league_list[num].endTime
    if (!checkFes(data.schedule, num)) {
      // @ts-expect-error TS(2339): Property 'rule' does not exist on type '{}'.
      result.rule = await rule2txt(data.locale, l_settings.vsRule.id)
      // @ts-expect-error TS(2339): Property 'stage1' does not exist on type '{}'.
      result.stage1 = await stage2txt(data.locale, l_settings.vsStages[0].id)
      // @ts-expect-error TS(2339): Property 'stage2' does not exist on type '{}'.
      result.stage2 = await stage2txt(data.locale, l_settings.vsStages[1].id)
      // @ts-expect-error TS(2339): Property 'stageImage1' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage1 = l_settings.vsStages[0].image.url
      // @ts-expect-error TS(2339): Property 'stageImage2' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage2 = l_settings.vsStages[1].image.url
    }
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * サーモン募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getSalmonD... Remove this comment to see the full error message
async function getSalmonData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const salmon_list = getSalmonList(data.schedule)
    const s_setting = salmon_list[num].setting

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = salmon_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = salmon_list[num].endTime
    // @ts-expect-error TS(2339): Property 'stage' does not exist on type '{}'.
    result.stage = await stage2txt(data.locale, s_setting.coopStage.id)
    // @ts-expect-error TS(2339): Property 'weapon1' does not exist on type '{}'.
    result.weapon1 = s_setting.weapons[0].image.url
    // @ts-expect-error TS(2339): Property 'weapon2' does not exist on type '{}'.
    result.weapon2 = s_setting.weapons[1].image.url
    // @ts-expect-error TS(2339): Property 'weapon3' does not exist on type '{}'.
    result.weapon3 = s_setting.weapons[2].image.url
    // @ts-expect-error TS(2339): Property 'weapon4' does not exist on type '{}'.
    result.weapon4 = s_setting.weapons[3].image.url
    // @ts-expect-error TS(2339): Property 'stageImage' does not exist on type '{}'.
    result.stageImage = s_setting.coopStage.thumbnailImage.url
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * Xマッチ用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
async function getXMatchData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const x_list = getXMatchList(data.schedule)
    const x_settings = x_list[num].xMatchSetting

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = x_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = x_list[num].endTime
    if (!checkFes(data.schedule, num)) {
      // @ts-expect-error TS(2339): Property 'rule' does not exist on type '{}'.
      result.rule = await rule2txt(data.locale, x_settings.vsRule.id)
      // @ts-expect-error TS(2339): Property 'stage1' does not exist on type '{}'.
      result.stage1 = await stage2txt(data.locale, x_settings.vsStages[0].id)
      // @ts-expect-error TS(2339): Property 'stage2' does not exist on type '{}'.
      result.stage2 = await stage2txt(data.locale, x_settings.vsStages[1].id)
      // @ts-expect-error TS(2339): Property 'stageImage1' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage1 = x_settings.vsStages[0].image.url
      // @ts-expect-error TS(2339): Property 'stageImage2' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage2 = x_settings.vsStages[1].image.url
    }
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * フェス募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getFesData... Remove this comment to see the full error message
async function getFesData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const fes_list = getFesList(data.schedule)
    const f_setting = fes_list[num].festMatchSetting

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = fes_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = fes_list[num].endTime
    if (checkFes(data.schedule, num)) {
      // @ts-expect-error TS(2339): Property 'rule' does not exist on type '{}'.
      result.rule = await rule2txt(data.locale, f_setting.vsRule.id)
      // @ts-expect-error TS(2339): Property 'stage1' does not exist on type '{}'.
      result.stage1 = await stage2txt(data.locale, f_setting.vsStages[0].id)
      // @ts-expect-error TS(2339): Property 'stage2' does not exist on type '{}'.
      result.stage2 = await stage2txt(data.locale, f_setting.vsStages[1].id)
      // @ts-expect-error TS(2339): Property 'stageImage1' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage1 = f_setting.vsStages[0].image.url
      // @ts-expect-error TS(2339): Property 'stageImage2' does not exist on type '{}'... Remove this comment to see the full error message
      result.stageImage2 = f_setting.vsStages[1].image.url
    }
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * ビッグラン募集用データに整形する
 * @param {*} data フェッチしたデータ
 * @param {Number} num スケジュール番号
 * @returns 連想配列で返す
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getBigRunD... Remove this comment to see the full error message
async function getBigRunData (data: $TSFixMe, num: $TSFixMe) {
  try {
    const big_run_list = getBigRunList(data.schedule)
    const b_setting = big_run_list[num].setting

    const result = {}
    // @ts-expect-error TS(2339): Property 'startTime' does not exist on type '{}'.
    result.startTime = big_run_list[num].startTime
    // @ts-expect-error TS(2339): Property 'endTime' does not exist on type '{}'.
    result.endTime = big_run_list[num].endTime
    // @ts-expect-error TS(2339): Property 'stage' does not exist on type '{}'.
    result.stage = await stage2txt(data.locale, b_setting.coopStage.id)
    // @ts-expect-error TS(2339): Property 'weapon1' does not exist on type '{}'.
    result.weapon1 = b_setting.weapons[0].image.url
    // @ts-expect-error TS(2339): Property 'weapon2' does not exist on type '{}'.
    result.weapon2 = b_setting.weapons[1].image.url
    // @ts-expect-error TS(2339): Property 'weapon3' does not exist on type '{}'.
    result.weapon3 = b_setting.weapons[2].image.url
    // @ts-expect-error TS(2339): Property 'weapon4' does not exist on type '{}'.
    result.weapon4 = b_setting.weapons[3].image.url
    // @ts-expect-error TS(2339): Property 'stageImage' does not exist on type '{}'.
    result.stageImage = b_setting.coopStage.thumbnailImage.url
    return result
  } catch (error) {
    logger.error(error)
  }
}

/**
 * localeをもとにIDをステージ名に変換
 * @param {*} locale ロケールデータ
 * @param {*} id 変換するID
 * @returns ステージ名
 */
async function stage2txt (locale: $TSFixMe, id: $TSFixMe) {
  try {
    const stages = locale.stages
    if (isEmpty(stages[id])) {
      return 'そーりー・あんでふぁいんど'
    } else {
      return stages[id].name
    }
  } catch (error) {
    logger.error(error)
  }
}

/**
 * localeをもとにIDをルール名に変換
 * @param {*} locale ロケールデータ
 * @param {*} id 変換するID
 * @returns ルール名
 */
async function rule2txt (locale: $TSFixMe, id: $TSFixMe) {
  try {
    const rules = locale.rules
    if (isEmpty(rules[id])) {
      return 'そーりー・あんでふぁいんど'
    } else {
      return rules[id].name
    }
  } catch (error) {
    logger.error(error)
  }
}
