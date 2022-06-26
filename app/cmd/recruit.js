const fetch = require('node-fetch');
const common = require('../common.js');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { recruitCanvas, stageCanvas, stageDoubleCanvas } = require('./recruit_canvas.js');
const schedule_url = 'https://splatoon2.ink/data/schedules.json';
const coop_schedule_url = 'https://splatoon2.ink/data/coop-schedules.json';
const { URLSearchParams } = require('url');

module.exports = {
    handleRecruit: handleRecruit,
    getCloseEmbed: getCloseEmbed,
    getCommandHelpEmbed: getCommandHelpEmbed,
};

function handleRecruit(msg) {
    if (msg.content.startsWith('next') && msg.channel.name != 'botコマンド') {
        recruitLeagueMatch(msg, 1);
    }
    if (msg.content.startsWith('now') || msg.content.startsWith('nou')) {
        recruitLeagueMatch(msg, 0);
    }

    if (msg.content.startsWith('nawabari')) {
        regularMatch(msg);
    }

    if (msg.content.startsWith('run')) {
        salmonRun(msg);
    }

    /**
     * 別ゲー
     */
    if (msg.content.startsWith('!mhr')) {
        monsterHunterRize(msg);
    }
    if (msg.content.startsWith('!apex')) {
        apexLegends(msg);
    }
    if (msg.content.startsWith('!dbd')) {
        deadByDayLight(msg);
    }
}

async function recruitLeagueMatch(msg, type) {
    const channelName = 'リグマ募集';
    let mention = '@everyone';
    if (isNotThisChannel(msg, channelName)) {
        return;
    }

    if (isRookieChannel(msg)) {
        const role_id = await msg.guild.roles.cache.find((role) => role.name === '🔰新入部員');
        mention = `${role_id}`;
    }

    var strCmd = msg.cleanContent.replace(/　/g, ' ');
    strCmd = strCmd.replace('  ', ' ');
    const args = strCmd.split(' ');
    args.shift();
    if (strCmd.match('〆')) {
        sendCloseMessage(msg, '`now` か `next`');
    } else {
        try {
            const response = await fetch(schedule_url);
            const data = await response.json();
            const l_args = common.getLeague(data, type).split(',');
            let condition = 'なし';
            let txt = mention + ' 【リグマ募集】\n' + `<@${msg.author.id}>` + 'たんがリグメン募集中でし！\n';
            if (args.length > 0) condition = args.join(' ');
            const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[type].stage_a.image;
            const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[type].stage_b.image;
            const stageImages = [stage_a, stage_b];
            sendLeagueMatch(msg, txt, condition, l_args, stageImages);
        } catch (error) {
            msg.channel.send('なんかエラーでてるわ');
            console.error(error);
        }
    }
}

async function regularMatch(msg) {
    const channelName = 'ナワバリ・フェス募集';
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.cleanContent.replace(/　/g, ' ');
    strCmd = strCmd.replace('  ', ' ');
    const args = strCmd.split(' ');
    args.shift();
    if (strCmd.match('〆')) {
        sendCloseMessage(msg, 'nawabari');
    } else {
        try {
            const response = await fetch(schedule_url);
            const data = await response.json();
            const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_a.image;
            const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.regular[0].stage_b.image;
            const stageImages = [stage_a, stage_b];
            let condition = 'なし';
            let txt = '@everyone 【ナワバリ募集】\n' + `<@${msg.author.id}>` + 'たんがナワバリ中でし！\n';
            if (args.length > 0) condition = args.join(' ') + '\n';
            txt += 'よければ合流しませんか？';
            const date = common.unixTime2mdwhm(data.regular[0].start_time) + ' – ' + common.unixTime2mdwhm(data.regular[0].end_time);
            const regular_stage = common.stage2txt(data.regular[0].stage_a.id) + '\n' + common.stage2txt(data.regular[0].stage_b.id) + '\n';

            const title = ['レギュラーマッチ', '#CFF622', '#45520B'];
            const icon = ['https://splatoon2.ink/assets/img/battle-regular.01b5ef.png', 22, 20, 80, 80];
            const thumbnail = ['https://splatoon2.ink/assets/img/battle-regular.01b5ef.png', 400, 160, 1.3, 1.3];

            const recruitBuffer = await recruitCanvas(title, icon, date, 'ステージ', thumbnail, regular_stage, condition);
            const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

            const stage = new MessageAttachment(await stageDoubleCanvas(stageImages), 'stages.png');

            const sentMessage = await msg.channel.send({
                content: txt,
                files: [recruit, stage],
            });
            // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
            sentMessage.edit({ components: [recruitActionRow(sentMessage)] });
            setTimeout(function () {
                const host_mention = `<@${msg.author.id}>`;
                sentMessage.edit({
                    content: `${host_mention}たんの募集は〆！`,
                    components: [disableButtons()],
                });
            }, 7200000);
        } catch (error) {
            msg.channel.send('なんかエラーでてるわ');
            console.error(error);
        }
    }
}

async function salmonRun(msg) {
    const channelName = 'サーモン募集';
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.cleanContent.replace(/　/g, ' ');
    strCmd = strCmd.replace('  ', ' ');
    const args = strCmd.split(' ');
    args.shift();
    if (strCmd.match('〆')) {
        sendCloseMessage(msg, 'run');
    } else {
        try {
            const response = await fetch(coop_schedule_url);
            const data = await response.json();
            const stage = 'https://splatoon2.ink/assets/splatnet' + data.details[0].stage.image;
            let condition = 'なし';
            let txt = '@everyone 【バイト募集】\n' + `<@${msg.author.id}>` + 'たんがバイト中でし！\n';
            if (args.length > 0) condition = args.join(' ') + '\n';
            txt += 'よければ合流しませんか？';
            const date = common.unixTime2mdwhm(data.details[0].start_time) + ' – ' + common.unixTime2mdwhm(data.details[0].end_time);
            const coop_stage = common.coop_stage2txt(data.details[0].stage.image) + '\n';

            const weapons =
                common.weapon2txt(data.details[0].weapons[0].id) +
                '・' +
                common.weapon2txt(data.details[0].weapons[1].id) +
                '\n' +
                common.weapon2txt(data.details[0].weapons[2].id) +
                '・' +
                common.weapon2txt(data.details[0].weapons[3].id);

            const title = ['サーモンラン', '#FF5600', '#FFFFFF'];
            const icon = ['https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png', 22, 35, 80, 52.8];
            const thumbnail = ['https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png', 296, 424, 0.8, 0.8];

            const recruitBuffer = await recruitCanvas(title, icon, date, coop_stage, thumbnail, weapons, condition);
            const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

            const stageImage = new MessageAttachment(await stageCanvas(stage), 'stages.png');

            const sentMessage = await msg.channel.send({
                content: txt,
                files: [recruit, stageImage],
            });
            // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
            sentMessage.edit({ components: [recruitActionRow(sentMessage)] });
            setTimeout(function () {
                const host_mention = `<@${msg.author.id}>`;
                sentMessage.edit({
                    content: `${host_mention}たんの募集は〆！`,
                    components: [disableButtons()],
                });
            }, 7200000);
        } catch (error) {
            msg.channel.send('なんかエラーでてるわ');
            console.error(error);
        }
    }
}

function monsterHunterRize(msg) {
    const role_id = msg.guild.roles.cache.find((role) => role.name === 'ハンター');
    let title = 'MONSTER HUNTER RISE';
    let txt = role_id.toString() + ' 【モンハンライズ募集】\n' + `<@${msg.author.id}>` + 'たんがモンハンライズ参加者募集中でし！\n';
    let color = '#3ce3f5';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/master/images/games/MonsterHunterRise.jpeg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/master/images/games/MonsterHunterRise_logo.png';
    sendOtherGames(msg, title, txt, color, image, logo);
}

function apexLegends(msg) {
    const role_id = msg.guild.roles.cache.find((role) => role.name === 'レジェンド');
    let title = 'Apex Legends';
    let txt = role_id.toString() + ' 【Apex Legends募集】\n' + `<@${msg.author.id}>` + 'たんがApexLegendsの参加者募集中でし！\n';
    let color = '#F30100';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/master/images/games/ApexLegends.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/master/images/games/ApexLegends_logo.png';
    sendOtherGames(msg, title, txt, color, image, logo);
}

function deadByDayLight(msg) {
    const role_id = msg.guild.roles.cache.find((role) => role.name === 'DbD');
    let title = 'Dead by Daylight';
    const txt = role_id.toString() + ' 【Dead by Daylight募集】\n' + `<@${msg.author.id}>` + 'たんがDbD参加者募集中でし！\n';
    let color = '#84331F';
    const image = 'https://raw.githubusercontent.com/shngmsw/ikabu/master/images/games/DeadByDaylight.jpg';
    const logo = 'https://raw.githubusercontent.com/shngmsw/ikabu/master/images/games/deadbydaylight_logo.png';
    sendOtherGames(msg, title, txt, color, image, logo);
}

async function sendOtherGames(msg, title, txt, color, image, logo) {
    const channelName = '別ゲー募集';
    if (isNotThisChannel(msg, channelName)) {
        return;
    }
    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = strCmd.replace('  ', ' ');
    const args = strCmd.split(' ');
    args.shift();
    if (args[0] == '〆') {
        sendCloseMessage(msg, '`!apex` か `!dbd` か `!mhr`');
    } else {
        let condition = 'なし';
        if (args.length > 0) condition = args.join(' ') + '\n';
        const embed = new MessageEmbed()
            .setAuthor({
                name: title,
                iconURL: logo,
            })
            .setColor(color)
            .addFields({
                name: '参加条件',
                value: condition,
            })
            .setImage(image)
            .setThumbnail(logo);

        try {
            const sentMessage = await msg.channel.send({
                content: txt,
                embeds: [embed],
            });
            // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
            sentMessage.edit({ components: [recruitActionRow(sentMessage)] });
            setTimeout(function () {
                const host_mention = `<@${msg.author.id}>`;
                sentMessage.edit({
                    content: `${host_mention}たんの募集は〆！`,
                    components: [disableButtons()],
                });
            }, 7200000);
        } catch (error) {
            console.log(error);
        }
    }
}

async function sendLeagueMatch(msg, txt, condition, l_args, stageImages) {
    var l_date = l_args[0];
    var l_rule = l_args[1];
    var l_stage = l_args[2];
    var thumbnail_url;
    var thumbnailXP;
    var thumbnailYP;
    switch (l_rule) {
        case 'ガチエリア':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
            var thumbnailXP = 680;
            var thumbnailYP = 240;
            var thumbScaleX = 0.7;
            var thumbScaleY = 0.7;
            break;
        case 'ガチヤグラ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
            var thumbnailXP = 420;
            var thumbnailYP = 85;
            var thumbScaleX = 1.0;
            var thumbScaleY = 1.0;
            break;
        case 'ガチホコバトル':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
            var thumbnailXP = 640;
            var thumbnailYP = 230;
            var thumbScaleX = 0.75;
            var thumbScaleY = 0.65;
            break;
        case 'ガチアサリ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
            var thumbnailXP = 450;
            var thumbnailYP = 120;
            var thumbScaleX = 1.0;
            var thumbScaleY = 1.0;
            break;
        default:
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png';
            var thumbnailXP = 380;
            var thumbnailYP = 90;
            var thumbScaleX = 1.0;
            var thumbScaleY = 1.0;
            break;
    }
    const title = ['リーグマッチ', '#F02D7E', '#FFFFFF'];
    const icon = ['https://cdn.glitch.me/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png', 15, 15, 90, 90];
    const thumbnail = [thumbnail_url, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY];

    const recruitBuffer = await recruitCanvas(title, icon, l_date, l_rule, thumbnail, l_stage, condition);
    const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

    const stage = new MessageAttachment(await stageDoubleCanvas(stageImages), 'stages.png');

    try {
        const sentMessage = await msg.channel.send({
            content: txt,
            files: [recruit, stage],
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitActionRow(sentMessage)] });
        setTimeout(function async() {
            const host_mention = `<@${msg.author.id}>`;
            sentMessage.edit({
                content: `${host_mention}たんの募集は〆！`,
                components: [disableButtons()],
            });
        }, 7200000);
    } catch (error) {
        console.log(error);
    }
}

function sendCloseMessage(msg, command) {
    try {
        msg.delete();
    } catch (error) {
        console.log(error);
    }
}

function getCloseEmbed() {
    const embed = new MessageEmbed();
    embed.setDescription(`↑の募集 〆`);
    return embed;
}
const recruit_command = {
    リグマ募集: '`now` か `next`',
    リグマ募集2: '`now` か `next`',
    'ナワバリ・フェス募集': `nawabari`,
    サーモン募集: `run`,
    別ゲー募集: '`!apex` か `!dbd` か `!mhr`',
};

function getCommandHelpEmbed(channelName) {
    let commandMessage;
    switch (channelName) {
        case 'リグマ募集':
            commandMessage = recruit_command.リグマ募集;
            break;
        case 'リグマ募集2':
            commandMessage = recruit_command.リグマ募集2;
            break;
        case 'ナワバリ・フェス募集':
            commandMessage = recruit_command['ナワバリ・フェス募集'];
            break;
        case 'サーモン募集':
            commandMessage = recruit_command.サーモン募集;
            break;
        case '別ゲー募集':
            commandMessage = recruit_command.別ゲー募集;
            break;

        default:
            break;
    }

    const embed = new MessageEmbed();
    embed.setDescription('募集コマンドは ' + `${commandMessage}` + `\n詳しくは <#${process.env.CHANNEL_ID_RECRUIT_HELP}> を確認するでし！`);
    return embed;
}

function isNotThisChannel(msg, channelName) {
    const msgSendedChannelName = msg.channel.name;
    if (!msgSendedChannelName.match(channelName)) {
        msg.reply('このコマンドはこのチャンネルでは使えないでし！');
        return true;
    }
    return false;
}

function isRookieChannel(msg) {
    const msgSendedChannelName = msg.channel.name;
    const rookieChannelName = '🔰リグマ募集';
    if (msgSendedChannelName === rookieChannelName) {
        return true;
    }
    return false;
}

function recruitActionRow(msg) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('mid', msg.id);
    cancelParams.append('cid', msg.channel.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('mid', msg.id);
    closeParams.append('cid', msg.channel.id);

    return new MessageActionRow().addComponents([
        new MessageButton().setCustomId(joinParams.toString()).setLabel('参加').setStyle('PRIMARY'),
        new MessageButton().setCustomId(cancelParams.toString()).setLabel('キャンセル').setStyle('DANGER'),
        new MessageButton().setCustomId(closeParams.toString()).setLabel('〆').setStyle('SECONDARY'),
    ]);
}
function disableButtons() {
    let buttons = new MessageActionRow().addComponents([
        new MessageButton().setCustomId('join').setLabel('参加').setStyle('PRIMARY').setDisabled(),
        new MessageButton().setCustomId('cancel').setLabel('キャンセル').setStyle('DANGER').setDisabled(),
        new MessageButton().setCustomId('close').setLabel('〆').setStyle('SECONDARY').setDisabled(),
    ]);
    return buttons;
}
