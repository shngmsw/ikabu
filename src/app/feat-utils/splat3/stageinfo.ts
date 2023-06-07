import Discord from 'discord.js';

import { log4js_obj } from '../../../log4js_settings';
import {
    getAnarchyList,
    getXMatchList,
    getAnarchyChallengeData,
    getAnarchyOpenData,
    getXMatchData,
    checkFes,
    getSchedule,
} from '../../common/apis/splatoon3_ink';
import { sp3Schedule } from '../../common/apis/types/schedule';
import { formatDatetime, dateformat } from '../../common/convert_datetime.js';
import { assertExistCheck } from '../../common/others';

const logger = log4js_obj.getLogger('interaction');

export function handleStageInfo(msg: $TSFixMe) {
    if (msg.content.startsWith('stageinfo')) {
        stageinfo(msg);
    } else if (msg.content.startsWith('stage')) {
        sf(msg);
    }
}
async function sf(msg: $TSFixMe) {
    try {
        const schedule = await getSchedule();

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

        msg.channel.send({
            embeds: [embedStr_x, embedStr_challenge, embedStr_open],
        });
    } catch (error) {
        msg.channel.send('なんかエラーでてるわ');
        logger.error(error);
    }
}

async function stageinfo(msg: $TSFixMe) {
    // 過去分は削除
    msgDelete(msg);

    try {
        sf(msg);
    } catch (error) {
        msg.channel.send('なんかエラーでてるわ');
        logger.error(error);
    }
}

async function getAOEmbed(schedule: sp3Schedule) {
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

async function getACEmbed(schedule: sp3Schedule) {
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

async function getXMatchEmbed(schedule: sp3Schedule) {
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

async function msgDelete(message: $TSFixMe) {
    // コマンドが送信されたチャンネルから直近100件(上限)メッセージを取得する
    const messages = await message.channel.messages.fetch({ limit: 100 });
    // それらのメッセージを一括削除
    message.channel.bulkDelete(messages);
}
