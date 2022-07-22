const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');
const { stage2txt, rule2txt } = require('../../common.js');
const { MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const schedule_url = 'https://splatoon2.ink/data/schedules.json';
const { URLSearchParams } = require('url');

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), { family: 'Splatfont' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), { family: 'Genshin' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), { family: 'Genshin-Bold' });
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

module.exports = {
    leagueRecruit: leagueRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function leagueRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    let recruit_num = options.getInteger('募集人数');
    let condition = options.getString('参加条件');
    let host_user = interaction.member.user;
    let user1 = options.getUser('参加者1');
    let user2 = options.getUser('参加者2');
    let member_counter = recruit_num; // リグマプレイ人数のカウンター
    let type;

    if (options.getSubcommand() === 'now') {
        type = 0;
    } else if (options.getSubcommand() === 'next') {
        type = 1;
    }

    if (recruit_num < 1 || recruit_num > 3) {
        await interaction.reply({
            content: '募集人数は1～3までで指定するでし！',
            ephemeral: true,
        });
        return;
    } else {
        member_counter++;
    }

    // プレイヤー指定があればカウンターを増やす
    if (user1 != null) member_counter++;
    if (user2 != null) member_counter++;

    if (member_counter != 2 && member_counter != 4) {
        await interaction.reply({
            content:
                '募集人数がおかしいでし！\n一緒に遊ぶメンバーがいる場合、参加者に指定するでし！\nこのサーバーにいないメンバーと遊ぶのはイカ部心得違反でし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: true });

    // 新入部員用リグマ募集ようにメンションを変更
    let mention = '@everyone';
    if (channel.name === '🔰リグマ募集') {
        const role_id = await interaction.guild.roles.cache.find((role) => role.name === '🔰新入部員');
        mention = `${role_id}`;
    }

    try {
        const response = await fetch(schedule_url);
        const data = await response.json();
        const l_args = getLeague(data, type).split(',');
        let txt = mention + ' 【リグマ募集】\n' + `<@${host_user.id}>` + 'たんがリグメン募集中でし！\n';

        if (user1 != null && user2 != null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        if (condition == null) condition = 'なし';
        const stage_a = 'https://splatoon2.ink/assets/splatnet' + data.league[type].stage_a.image;
        const stage_b = 'https://splatoon2.ink/assets/splatnet' + data.league[type].stage_b.image;
        const stageImages = [stage_a, stage_b];
        await sendLeagueMatch(
            interaction,
            channel,
            txt,
            recruit_num,
            condition,
            member_counter,
            host_user,
            user1,
            user2,
            l_args,
            stageImages,
        );
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function sendLeagueMatch(interaction, channel, txt, recruit_num, condition, count, host_user, user1, user2, l_args, stageImages) {
    let l_date = l_args[0]; // 日付
    let l_time = l_args[1]; // 時間
    let l_rule = l_args[2]; // ガチルール
    let l_stage1 = l_args[3]; // ステージ1
    let l_stage2 = l_args[4]; // ステージ2
    let thumbnail_url; // ガチルールのアイコン
    let thumbnailXP; // アイコンx座標
    let thumbnailYP; // アイコンy座標
    let thumbScaleX; // アイコン幅
    let thumbScaleY; // アイコン高さ
    switch (l_rule) {
        case 'ガチエリア':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_area.png';
            thumbnailXP = 600;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチヤグラ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_yagura.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 90;
            thumbScaleY = 100;
            break;
        case 'ガチホコバトル':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_hoko.png';
            thumbnailXP = 585;
            thumbnailYP = 23;
            thumbScaleX = 110;
            thumbScaleY = 90;
            break;
        case 'ガチアサリ':
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fobject_asari.png';
            thumbnailXP = 570;
            thumbnailYP = 20;
            thumbScaleX = 120;
            thumbScaleY = 100;
            break;
        default:
            thumbnail_url = 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png';
            thumbnailXP = 595;
            thumbnailYP = 20;
            thumbScaleX = 100;
            thumbScaleY = 100;
            break;
    }

    const thumbnail = [thumbnail_url, thumbnailXP, thumbnailYP, thumbScaleX, thumbScaleY];

    const recruitBuffer = await recruitCanvas(recruit_num, count, host_user, user1, user2, condition);
    const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

    const rule = new MessageAttachment(await ruleCanvas(l_rule, l_date, l_time, l_stage1, l_stage2, stageImages, thumbnail), 'stages.png');

    try {
        const sentMessage = await channel.send({
            content: txt,
            files: [recruit, rule],
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitDeleteButton(sentMessage, host_user)] });
        if (count == 2) {
            await interaction.editReply({
                content:
                    '2リグで募集がかかったでし！\n4リグで募集をたてるには参加者に指定するか、募集人数を変更して募集し直すでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        } else {
            await interaction.editReply({
                content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
                ephemeral: true,
            });
        }

        // 15秒後に削除ボタンを消す
        await sleep(15000);
        let cmd_message = await channel.messages.cache.get(sentMessage.id);
        if (cmd_message != undefined) {
            sentMessage.edit({ components: [recruitActionRow(sentMessage, host_user)] });
        } else {
            return;
        }

        // 2時間後にボタンを無効化する
        setTimeout(function async() {
            const host_mention = `<@${host_user.id}>`;
            sentMessage.edit({
                content: `${host_mention}たんの募集は〆！`,
                components: [disableButtons()],
            });
        }, 7200000 - 15000);
    } catch (error) {
        console.log(error);
    }
}

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
async function recruitCanvas(recruit_num, count, host_user, user1, user2, condition) {
    blank_avatar_url = 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/blank_avatar.png'; // blankのアバター画像URL

    const recruitCanvas = Canvas.createCanvas(720, 550);
    const recruit_ctx = recruitCanvas.getContext('2d');

    // 下地
    createRoundRect(recruit_ctx, 1, 1, 718, 548, 30);
    recruit_ctx.fillStyle = '#2F3136';
    recruit_ctx.fill();
    recruit_ctx.strokeStyle = '#FFFFFF';
    recruit_ctx.lineWidth = 4;
    recruit_ctx.stroke();

    let league_icon = await Canvas.loadImage('https://cdn.glitch.me/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fleague.png');
    recruit_ctx.drawImage(league_icon, 20, 20, 80, 80);

    recruit_ctx.font = '50px Splatfont';
    recruit_ctx.fillStyle = '#F02D7E';
    recruit_ctx.fillText('リーグマッチ', 115, 80);
    recruit_ctx.strokeStyle = '#FFFFFF';
    recruit_ctx.lineWidth = 2;
    recruit_ctx.strokeText('リーグマッチ', 115, 80);

    // 募集主の画像
    let host_img = await Canvas.loadImage(host_user.displayAvatarURL({ format: 'png' }));
    recruit_ctx.save();
    drawArcImage(recruit_ctx, host_img, 40, 120, 50);
    recruit_ctx.strokeStyle = '#1e1f23';
    recruit_ctx.lineWidth = 9;
    recruit_ctx.stroke();
    recruit_ctx.restore();

    let user1_url = blank_avatar_url;
    let user2_url = blank_avatar_url;
    let user3_url = blank_avatar_url;

    // 参加者指定があれば、画像を拾ってくる
    if (user1 != null && user2 != null) {
        user1_url = user1.displayAvatarURL({ format: 'png' });
        user2_url = user2.displayAvatarURL({ format: 'png' });
    } else if (user1 != null && user2 == null) {
        user1_url = user1.displayAvatarURL({ format: 'png' });
    } else if (user1 == null && user2 != null) {
        user1_url = user2.displayAvatarURL({ format: 'png' });
    }

    let user1_img = await Canvas.loadImage(user1_url);
    recruit_ctx.save();
    drawArcImage(recruit_ctx, user1_img, 158, 120, 50);
    recruit_ctx.strokeStyle = '#1e1f23';
    recruit_ctx.lineWidth = 9;
    recruit_ctx.stroke();
    recruit_ctx.restore();

    // カウンターの値に応じて2リグ表記か4リグ表記か判定
    if (count == 4) {
        let user2_img = await Canvas.loadImage(user2_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user2_img, 276, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();

        let user3_img = await Canvas.loadImage(user3_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user3_img, 394, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();
    }

    let host_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
    recruit_ctx.drawImage(host_icon, 0, 0, host_icon.width, host_icon.height, 90, 172, 75, 75);

    recruit_ctx.font = '39px "Splatfont"';
    recruit_ctx.fillStyle = '#FFFFFF';
    recruit_ctx.fillText('募集人数', 525, 155);
    recruit_ctx.strokeStyle = '#2D3130';
    recruit_ctx.lineWidth = 1.0;
    recruit_ctx.strokeText('募集人数', 525, 155);

    recruit_ctx.font = '42px "Splatfont"';
    recruit_ctx.fillStyle = '#FFFFFF';
    recruit_ctx.fillText('@' + recruit_num, 580, 218);
    recruit_ctx.strokeStyle = '#2D3130';
    recruit_ctx.lineWidth = 1.0;
    recruit_ctx.strokeText('@' + recruit_num, 580, 218);

    recruit_ctx.font = '43px "Splatfont"';
    recruit_ctx.fillStyle = '#FFFFFF';
    recruit_ctx.fillText('参加条件', 35, 290);
    recruit_ctx.strokeStyle = '#2D3130';
    recruit_ctx.lineWidth = 1.0;
    recruit_ctx.strokeText('参加条件', 35, 290);

    recruit_ctx.font = '30px "Genshin", "SEGUI"';
    const width = 600;
    const size = 40;
    let column = [''];
    let line = 0;
    condition = condition.replace('{br}', '\n', 'gm');

    // 幅に合わせて自動改行
    for (var i = 0; i < condition.length; i++) {
        var char = condition.charAt(i);

        if (char == '\n') {
            line++;
            column[line] = '';
        } else if (recruit_ctx.measureText(column[line] + char).width > width) {
            line++;
            column[line] = char;
        } else {
            column[line] += char;
        }
    }

    if (column.length > 5) {
        column[4] += '…';
    }

    for (var j = 0; j < column.length; j++) {
        if (j < 5) {
            recruit_ctx.fillText(column[j], 65, 350 + size * j);
        }
    }

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
async function ruleCanvas(l_rule, l_date, l_time, l_stage1, l_stage2, stageImages, thumbnail) {
    const ruleCanvas = Canvas.createCanvas(720, 550);
    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    rule_ctx.font = '33px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText('ルール', 35, 80);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText('ルール', 35, 80);

    rule_width = rule_ctx.measureText(l_rule).width;
    rule_ctx.font = '45px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(l_rule, (320 - rule_width) / 2, 145); // 中央寄せ
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(l_rule, (320 - rule_width) / 2, 145);

    rule_ctx.font = '32px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText('日時', 35, 220);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText('日時', 35, 220);

    date_width = rule_ctx.measureText(l_date).width;
    rule_ctx.font = '35px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(l_date, (350 - date_width) / 2, 270);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(l_date, (350 - date_width) / 2, 270);

    time_width = rule_ctx.measureText(l_time).width;
    rule_ctx.font = '35px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(l_time, 15 + (350 - time_width) / 2, 320);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(l_time, 15 + (350 - time_width) / 2, 320);

    rule_ctx.font = '33px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText('ステージ', 35, 390);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText('ステージ', 35, 390);

    stage1_width = rule_ctx.measureText(l_stage1).width;
    rule_ctx.font = '35px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(l_stage1, (350 - stage1_width) / 2 + 10, 440);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(l_stage1, (350 - stage1_width) / 2 + 10, 440);

    stage2_width = rule_ctx.measureText(l_stage2).width;
    rule_ctx.font = '35px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(l_stage2, (350 - stage2_width) / 2 + 10, 490);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(l_stage2, (350 - stage2_width) / 2 + 10, 490);

    let stage1_img = await Canvas.loadImage(stageImages[0]);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 130, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage1_img, 370, 130, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    let stage2_img = await Canvas.loadImage(stageImages[1]);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 340, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage2_img, 370, 340, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    rule_ctx.save();
    const rule_img = await Canvas.loadImage(thumbnail[0]);
    rule_ctx.drawImage(rule_img, 0, 0, rule_img.width, rule_img.height, thumbnail[1], thumbnail[2], thumbnail[3], thumbnail[4]);
    rule_ctx.restore();

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}

function recruitDeleteButton(msg, host_user) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);
    joinParams.append('hid', host_user.id);

    const deleteParams = new URLSearchParams();
    deleteParams.append('d', 'del');
    deleteParams.append('mid', msg.id);
    deleteParams.append('cid', msg.channel.id);
    deleteParams.append('hid', host_user.id);

    let button = new MessageActionRow();
    button.addComponents([
        new MessageButton().setCustomId(joinParams.toString()).setLabel('参加').setStyle('PRIMARY'),
        new MessageButton().setCustomId(deleteParams.toString()).setLabel('削除').setStyle('DANGER'),
    ]);
    return button;
}

function recruitActionRow(msg, host_user) {
    const joinParams = new URLSearchParams();
    joinParams.append('d', 'jr');
    joinParams.append('mid', msg.id);
    joinParams.append('cid', msg.channel.id);
    joinParams.append('hid', host_user.id);

    const cancelParams = new URLSearchParams();
    cancelParams.append('d', 'cr');
    cancelParams.append('mid', msg.id);
    cancelParams.append('cid', msg.channel.id);
    cancelParams.append('hid', host_user.id);

    const closeParams = new URLSearchParams();
    closeParams.append('d', 'close');
    closeParams.append('mid', msg.id);
    closeParams.append('cid', msg.channel.id);
    closeParams.append('hid', host_user.id);

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

/*
 角が丸い四角形を作成
 x,yは座標
 width,heightは幅と高さ
 radiusは角丸の半径
*/
function createRoundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

/**
 * 座標の位置に円形にクリップされた画像を表示
 * @param {*} ctx Canvas Context
 * @param {*} img 描写する画像
 * @param {*} xPosition x座標
 * @param {*} yPosition y座標
 * @param {*} radius 半径
 */
function drawArcImage(ctx, img, xPosition, yPosition, radius) {
    ctx.beginPath();
    ctx.arc(xPosition + radius, yPosition + radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height, xPosition, yPosition, radius * 2, radius * 2);
}

/**
 * commonにあるgetLeagueを、情報を2行に分けるためにカスタムしたもの
 */
function getLeague(data, x) {
    var WeekChars = ['(日)', '(月)', '(火)', '(水)', '(木)', '(金)', '(土)'];

    let stage1;
    let stage2;
    let date_str;
    let time_str;
    let rule;
    let rstr;
    let start_time = new Date(data.league[x].start_time * 1000);
    let end_time = new Date(data.league[x].end_time * 1000);
    date_str =
        start_time.getFullYear() + '/' + (start_time.getMonth() + 1) + '/' + start_time.getDate() + ' ' + WeekChars[start_time.getDay()];
    time_str =
        start_time.getHours() +
        ':' +
        ('0' + start_time.getMinutes()).slice(-2) +
        ' - ' +
        end_time.getHours() +
        ':' +
        ('0' + end_time.getMinutes()).slice(-2);
    rule = rule2txt(data.league[x].rule.key);
    stage1 = stage2txt(data.league[x].stage_a.id);
    stage2 = stage2txt(data.league[x].stage_b.id);
    rstr = date_str + ',' + time_str + ',' + rule + ',' + stage1 + ',' + stage2;
    return rstr;
}
