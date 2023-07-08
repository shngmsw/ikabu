import { Guild, GuildScheduledEventCreateOptions } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import { event2txt, getEventList, getLocale, getSchedule } from '../apis/splatoon3.ink/splatoon3_ink';
import { exists, notExists } from '../others';

const logger = log4js_obj.getLogger('recruit');

export function getGuildEvents(guild: Guild) {
    const scheduledEvents = guild.scheduledEvents.cache;
    return scheduledEvents;
}

export async function createGuildEvent(guild: Guild, startTime: Date, endTime: Date, name: string, description: string) {
    const options: GuildScheduledEventCreateOptions = {
        scheduledStartTime: startTime,
        scheduledEndTime: endTime,
        name: name,
        description: description,
        privacyLevel: 2, // サーバー限定
        entityType: 3,
        entityMetadata: {
            location: 'イカ部',
        },
    };
    await guild.scheduledEvents.create(options);
}

function existsGuildEvent(guild: Guild, name: string) {
    const events = getGuildEvents(guild);
    const event = events.find((event) => event.name === name);
    return exists(event);
}

export async function subscribeSplatEventMatch(guild: Guild) {
    // splatoon3.inkからイベントを取得して現在登録中のギルドイベントになければイベントを作成する
    const schedule = await getSchedule();

    if (notExists(schedule)) {
        logger.error('schedule is not exists!');
        return;
    }
    const eventList = getEventList(schedule);
    const locale = await getLocale();

    eventList.forEach(async (event) => {
        let eventTexts = {
            title: event.leagueMatchSetting.leagueMatchEvent.name,
            description: event.leagueMatchSetting.leagueMatchEvent.desc,
            regulation: event.leagueMatchSetting.leagueMatchEvent.regulation,
        };
        if (exists(locale)) {
            eventTexts = await event2txt(locale, event.leagueMatchSetting.leagueMatchEvent.id);
        }

        const name = eventTexts.title;
        const description = eventTexts.regulation.replaceAll('<br />', '\n');
        const timePeriods = event.timePeriods;
        // スケジュールごとにイベントを作成する
        timePeriods.forEach(async (timePeriod) => {
            const startTime = new Date(timePeriod.startTime);
            const endTime = new Date(timePeriod.endTime);
            // startTimeが過去のものは作成しない
            if (startTime < new Date()) {
                return;
            }
            const eventNameWithTime = `${name} ${startTime.toLocaleString()}`;
            if (!existsGuildEvent(guild, eventNameWithTime)) {
                await createGuildEvent(guild, startTime, endTime, eventNameWithTime, description);
            }
        });
    });
}
