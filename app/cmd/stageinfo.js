const request = require('request');
const common = require('../common.js');
const Discord = require('discord.js');

module.exports = function handleStageInfo(msg) {
    if (msg.content.startsWith('stageinfo')) {
        stageinfo(msg);
    } else if (msg.content.startsWith('stage')) {
        sf(msg);
    }
};
function sf(msg) {
    request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            const embedStr = getEmbed(data.league);
            embedStr.setAuthor({
                name: 'リーグマッチ',
                iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png',
                url: 'https://splatoon2.ink',
            });
            embedStr.setImage('https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png');
            embedStr.setColor('#ED2D7C');
            msg.channel.send({ embeds: [embedStr] });
            const embedStr_gachi = getEmbed(data.gachi);
            embedStr_gachi.setAuthor({
                name: 'ガチマッチ',
                iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png',
                url: 'https://splatoon2.ink',
            });
            embedStr_gachi.setImage('https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png');
            embedStr_gachi.setColor('#F54910');
            msg.channel.send({ embeds: [embedStr_gachi] });
        } else {
            console.log('なんかエラーでてるわ');
        }
    });
}

function stageinfo(msg) {
    // 過去分は削除
    msgDelete(msg);

    request.get('https://splatoon2.ink/data/schedules.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            const embedStr = getEmbed(data.league);
            embedStr.setAuthor({
                name: 'リーグマッチ',
                iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png',
                url: 'https://splatoon2.ink',
            });
            embedStr.setImage('https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png');
            embedStr.setColor('#ED2D7C');
            msg.channel.send({ embeds: [embedStr] });
            const embedStr_gachi = getEmbed(data.gachi);
            embedStr_gachi.setAuthor({
                name: 'ガチマッチ',
                iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png',
                url: 'https://splatoon2.ink',
            });
            embedStr_gachi.setImage('https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fgachi.png');
            embedStr_gachi.setColor('#F54910');
            msg.channel.send({ embeds: [embedStr_gachi] });
        } else {
            msg.channel.send('なんかエラーでてるわ');
            console.log('なんかエラーでてるわ');
        }
    });
}

function getEmbed(data) {
    let x = 0;
    const field_s = '';
    const field_e = '';
    const stageEmbed = new Discord.MessageEmbed().setTitle('ステージ情報');
    // const field_s = 'fields: [';
    // const field_e = "]";
    let field_content = '';
    for (var attributename in data) {
        let stage;
        let date;
        let rule;
        let rstr;
        date = common.unixTime2mdwhm(data[attributename].start_time) + ' – ' + common.unixTime2hm(data[attributename].end_time);
        rule = common.rule2txt(data[attributename].rule.key);
        stage = common.stage2txt(data[attributename].stage_a.id) + '／' + common.stage2txt(data[attributename].stage_b.id);
        let name = date + ' 【' + rule + '】';
        stageEmbed.addField(name, stage);
        x = x + 1;
    }
    stageEmbed.setTimestamp();
    stageEmbed.setFooter({ text: 'StageInfo by splatoon2.ink' });
    return stageEmbed;
}

async function msgDelete(message) {
    // コマンドが送信されたチャンネルから直近100件(上限)メッセージを取得する
    const messages = await message.channel.messages.fetch({ limit: 100 });
    // それらのメッセージを一括削除
    message.channel.bulkDelete(messages);
}
