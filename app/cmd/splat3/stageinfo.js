const fetch = require('node-fetch');
const common = require('../../common');
const Discord = require('discord.js');
const { checkFes } = require('../../common');
const schedule_url = 'https://splatoon3.ink/data/schedules.json';

module.exports = function handleStageInfo(msg) {
    if (msg.content.startsWith('stageinfo')) {
        stageinfo(msg);
    } else if (msg.content.startsWith('stage')) {
        sf(msg);
    }
};
async function sf(msg) {
    try {
        const response = await fetch(schedule_url);
        const data = await response.json();

        const embedStr_league = getLeagueEmbed(data.data.leagueSchedules.nodes);
        embedStr_league.setAuthor({
            name: 'リーグマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/league_icon.png',
        });
        embedStr_league.setColor('#ED2D7C');

        const embedStr_challenge = getACEmbed(data.data.bankaraSchedules.nodes);
        embedStr_challenge.setAuthor({
            name: 'バンカラマッチ (チャレンジ)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        });
        embedStr_challenge.setColor('#F54910');

        const embedStr_open = getAOEmbed(data.data.bankaraSchedules.nodes);
        embedStr_open.setAuthor({
            name: 'バンカラマッチ (オープン)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        });
        embedStr_open.setColor('#F54910');

        const embedStr_x = getXMatchEmbed(data.data.xSchedules.nodes);
        embedStr_x.setAuthor({
            name: 'Xマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/x_match_icon.png',
        });
        embedStr_x.setColor('#0edb9b');
        msg.channel.send({
            embeds: [embedStr_league, embedStr_open, embedStr_challenge, embedStr_x],
        });
    } catch (error) {
        msg.channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function stageinfo(msg) {
    // 過去分は削除
    msgDelete(msg);

    try {
        const response = await fetch(schedule_url);
        const data = await response.json();

        const embedStr_league = getLeagueEmbed(data.data.leagueSchedules.nodes);
        embedStr_league.setAuthor({
            name: 'リーグマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/league_icon.png',
        });
        embedStr_league.setColor('#ED2D7C');
        msg.channel.send({ embeds: [embedStr_league] });

        const embedStr_challenge = getACEmbed(data.data.bankaraSchedules.nodes);
        embedStr_challenge.setAuthor({
            name: 'バンカラマッチ (チャレンジ)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        });
        embedStr_challenge.setColor('#F54910');
        msg.channel.send({ embeds: [embedStr_challenge] });

        const embedStr_open = getAOEmbed(data.data.bankaraSchedules.nodes);
        embedStr_open.setAuthor({
            name: 'バンカラマッチ (オープン)',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png',
        });
        embedStr_open.setColor('#F54910');
        msg.channel.send({ embeds: [embedStr_open] });

        const embedStr_x = getXMatchEmbed(data.data.xSchedules.nodes);
        embedStr_x.setAuthor({
            name: 'Xマッチ',
            iconURL: 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/x_match_icon.png',
        });
        embedStr_x.setColor('#0edb9b');
        msg.channel.send({ embeds: [embedStr_x] });
    } catch (error) {
        msg.channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

function getLeagueEmbed(league_list) {
    const stageEmbed = new Discord.MessageEmbed().setTitle('ステージ情報');
    for (var attributename in league_list) {
        let stage;
        let date;
        let rule;
        date =
            common.sp3unixTime2mdwhm(league_list[attributename].startTime) +
            ' – ' +
            common.sp3unixTime2hm(league_list[attributename].endTime);
        if (league_list[attributename].leagueMatchSetting == null) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = common.sp3rule2txt(league_list[attributename].leagueMatchSetting.vsRule.name);
            stage =
                common.sp3stage2txt(league_list[attributename].leagueMatchSetting.vsStages[0].vsStageId) +
                '／' +
                common.sp3stage2txt(league_list[attributename].leagueMatchSetting.vsStages[1].vsStageId);
        }
        let name = date + ' 【' + rule + '】';
        stageEmbed.addField(name, stage);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

function getAOEmbed(anarchy_list) {
    const stageEmbed = new Discord.MessageEmbed().setTitle('ステージ情報');
    for (var attributename in anarchy_list) {
        let stage;
        let date;
        let rule;
        date =
            common.sp3unixTime2mdwhm(anarchy_list[attributename].startTime) +
            ' – ' +
            common.sp3unixTime2hm(anarchy_list[attributename].endTime);
        if (anarchy_list[attributename].bankaraMatchSettings == null) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = common.sp3rule2txt(anarchy_list[attributename].bankaraMatchSettings[1].vsRule.name);
            stage =
                common.sp3stage2txt(anarchy_list[attributename].bankaraMatchSettings[1].vsStages[0].vsStageId) +
                '／' +
                common.sp3stage2txt(anarchy_list[attributename].bankaraMatchSettings[1].vsStages[1].vsStageId);
        }
        let name = date + ' 【' + rule + '】';
        stageEmbed.addField(name, stage);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

function getACEmbed(anarchy_list) {
    const stageEmbed = new Discord.MessageEmbed().setTitle('ステージ情報');
    for (var attributename in anarchy_list) {
        let stage;
        let date;
        let rule;
        date =
            common.sp3unixTime2mdwhm(anarchy_list[attributename].startTime) +
            ' – ' +
            common.sp3unixTime2hm(anarchy_list[attributename].endTime);
        if (anarchy_list[attributename].bankaraMatchSettings == null) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = common.sp3rule2txt(anarchy_list[attributename].bankaraMatchSettings[0].vsRule.name);
            stage =
                common.sp3stage2txt(anarchy_list[attributename].bankaraMatchSettings[0].vsStages[0].vsStageId) +
                '／' +
                common.sp3stage2txt(anarchy_list[attributename].bankaraMatchSettings[0].vsStages[1].vsStageId);
        }
        let name = date + ' 【' + rule + '】';
        stageEmbed.addField(name, stage);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

function getXMatchEmbed(x_list) {
    const stageEmbed = new Discord.MessageEmbed().setTitle('ステージ情報');
    for (var attributename in x_list) {
        let stage;
        let date;
        let rule;
        date = common.sp3unixTime2mdwhm(x_list[attributename].startTime) + ' – ' + common.sp3unixTime2hm(x_list[attributename].endTime);
        if (x_list[attributename].xMatchSetting == null) {
            rule = 'フェス期間中';
            stage = 'フェス期間中はお休みでし';
        } else {
            rule = common.sp3rule2txt(x_list[attributename].xMatchSetting.vsRule.name);
            stage =
                common.sp3stage2txt(x_list[attributename].xMatchSetting.vsStages[0].vsStageId) +
                '／' +
                common.sp3stage2txt(x_list[attributename].xMatchSetting.vsStages[1].vsStageId);
        }
        let name = date + ' 【' + rule + '】';
        stageEmbed.addField(name, stage);
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon3.ink' });
    return stageEmbed;
}

async function msgDelete(message) {
    // コマンドが送信されたチャンネルから直近100件(上限)メッセージを取得する
    const messages = await message.channel.messages.fetch({ limit: 100 });
    // それらのメッセージを一括削除
    message.channel.bulkDelete(messages);
}
