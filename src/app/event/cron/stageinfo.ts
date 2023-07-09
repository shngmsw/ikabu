import Discord, { Guild, GuildTextBasedChannel } from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import {
    getAnarchyList,
    getXMatchList,
    getAnarchyChallengeData,
    getAnarchyOpenData,
    getXMatchData,
    checkFes,
    getSchedule,
} from '../../common/apis/splatoon3.ink/splatoon3_ink';
import { Sp3Schedule } from '../../common/apis/splatoon3.ink/types/schedule';
import { formatDatetime, dateformat } from '../../common/convert_datetime.js';
import { searchChannelById } from '../../common/manager/channel_manager';
import { assertExistCheck, exists, notExists } from '../../common/others';

const logger = log4js_obj.getLogger('interaction');

export async function stageInfo(guild: Guild) {
    try {
        const schedule = await getSchedule();
        assertExistCheck(process.env.CHANNEL_ID_STAGE_INFO, 'CHANNEL_ID_STAGE_INFO');
        const stageInfoChannel = await searchChannelById(guild, process.env.CHANNEL_ID_STAGE_INFO);
        if (notExists(stageInfoChannel) || !stageInfoChannel.isTextBased()) {
            logger.error('stageInfo channel not found!');
            return;
        }

        if (exists(schedule)) {
            await msgDelete(stageInfoChannel);

            const embedStr_challenge = await getACEmbed(schedule);
            embedStr_challenge.setAuthor({
                name: 'バンカラマッチ (チャレンジ)',
                iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
            });
            embedStr_challenge.setColor('#F54910');

            const embedStr_open = await getAOEmbed(schedule);
            embedStr_open.setAuthor({
                name: 'バンカラマッチ (オープン)',
                iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
            });
            embedStr_open.setColor('#F54910');

            const embedStr_x = await getXMatchEmbed(schedule);
            embedStr_x.setAuthor({
                name: 'Xマッチ',
                iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/x_match_icon.png',
            });
            embedStr_x.setColor('#0edb9b');

            await stageInfoChannel.send({
                embeds: [embedStr_x, embedStr_challenge, embedStr_open],
            });
        } else {
            await stageInfoChannel.send('スケジュールデータを取得できなかったでし！\n`' + new Date().toLocaleString() + '`');
        }
    } catch (error) {
        logger.error(error);
    }
}

async function getAOEmbed(schedule: Sp3Schedule) {
    const stageEmbed = new Discord.EmbedBuilder().setTitle('ステージ情報');
    const num = getAnarchyList(schedule).length;
    for (let i = 0; i < num; i++) {
        const anarchyData = await getAnarchyOpenData(schedule, i);
        assertExistCheck(anarchyData);
        let stage;
        let rule;
        if (checkFes(schedule, i)) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = anarchyData.rule;
            stage = anarchyData.stage1 + '／' + anarchyData.stage2;
        }
        const anarchyStartDate = formatDatetime(anarchyData.startTime, dateformat.ymdwhm);
        const anarchyEndDate = formatDatetime(anarchyData.endTime, dateformat.hm);
        const name = anarchyStartDate + '-' + anarchyEndDate + ' 【' + rule + '】';
        stageEmbed.addFields([{ name: name, value: stage }]);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

async function getACEmbed(schedule: Sp3Schedule) {
    const stageEmbed = new Discord.EmbedBuilder().setTitle('ステージ情報');
    const num = getAnarchyList(schedule).length;
    for (let i = 0; i < num; i++) {
        const anarchyData = await getAnarchyChallengeData(schedule, i);
        assertExistCheck(anarchyData);
        let stage;
        let rule;
        if (checkFes(schedule, i)) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = anarchyData.rule;
            stage = anarchyData.stage1 + '／' + anarchyData.stage2;
        }
        const anarchyStartDate = formatDatetime(anarchyData.startTime, dateformat.ymdwhm);
        const anarchyEndDate = formatDatetime(anarchyData.endTime, dateformat.hm);
        const name = anarchyStartDate + '-' + anarchyEndDate + ' 【' + rule + '】';
        stageEmbed.addFields([{ name: name, value: stage }]);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

async function getXMatchEmbed(schedule: Sp3Schedule) {
    const stageEmbed = new Discord.EmbedBuilder().setTitle('ステージ情報');
    const num = getXMatchList(schedule).length;
    for (let i = 0; i < num; i++) {
        const xData = await getXMatchData(schedule, i);
        assertExistCheck(xData);
        let stage;
        let rule;
        if (checkFes(schedule, i)) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = xData.rule;
            stage = xData.stage1 + '／' + xData.stage2;
        }
        const xstart_date = formatDatetime(xData.startTime, dateformat.ymdwhm);
        const xEndDate = formatDatetime(xData.endTime, dateformat.hm);
        const name = xstart_date + '-' + xEndDate + ' 【' + rule + '】';
        stageEmbed.addFields([{ name: name, value: stage }]);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

async function msgDelete(stageInfoChannel: GuildTextBasedChannel) {
    try {
        // ステージ情報チャンネルの直近100件(上限)メッセージを取得する
        const messages = await stageInfoChannel.messages.fetch({ limit: 100 });
        // それらのメッセージを一括削除
        await stageInfoChannel.bulkDelete(messages);
    } catch (error) {
        logger.error(error);
    }
}
