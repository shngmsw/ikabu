const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');
const { unixTime2mdwhm, coop_stage2txt, weapon2txt } = require('../../common.js');
const { MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const coop_schedule_url = 'https://splatoon2.ink/data/coop-schedules.json';

const { URLSearchParams } = require('url');

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), { family: 'Splatfont' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), { family: 'Genshin' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), { family: 'Genshin-Bold' });
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

module.exports = {
    salmonRecruit: salmonRecruit,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function salmonRecruit(interaction) {
    if (!interaction.isCommand()) return;

    const options = interaction.options;
    const channel = interaction.channel;
    let recruit_num = options.getInteger('募集人数');
    let condition = options.getString('参加条件');
    let host_user = interaction.member.user;
    let user1 = options.getUser('参加者1');
    let user2 = options.getUser('参加者2');
    let member_counter = recruit_num; // プレイ人数のカウンター

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

    if (member_counter > 4) {
        await interaction.reply({
            content: '募集人数がおかしいでし！',
            ephemeral: true,
        });
        return;
    }

    // 'インタラクションに失敗'が出ないようにするため
    await interaction.deferReply({ ephemeral: true });

    try {
        const response = await fetch(coop_schedule_url);
        const data = await response.json();
        let txt = '@everyone 【バイト募集】\n' + `<@${host_user.id}>` + 'たんがバイト中でし！\n';

        if (user1 != null && user2 != null) {
            txt = txt + `<@${user1.id}>` + 'たんと' + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user1 != null) {
            txt = txt + `<@${user1.id}>` + 'たんの参加が既に決定しているでし！';
        } else if (user2 != null) {
            txt = txt + `<@${user2.id}>` + 'たんの参加が既に決定しているでし！';
        }

        txt += 'よければ合流しませんか？';

        if (condition == null) condition = 'なし';

        await sendSalmonRun(interaction, channel, txt, recruit_num, condition, member_counter, host_user, user1, user2, data.details[0]);
    } catch (error) {
        channel.send('なんかエラーでてるわ');
        console.error(error);
    }
}

async function sendSalmonRun(interaction, channel, txt, recruit_num, condition, count, host_user, user1, user2, detail) {
    let date = unixTime2mdwhm(detail.start_time) + ' – ' + unixTime2mdwhm(detail.end_time);
    let coop_stage = coop_stage2txt(detail.stage.image);
    let weapon1 = weapon2txt(detail.weapons[0].id);
    let weapon2 = weapon2txt(detail.weapons[1].id);
    let weapon3 = weapon2txt(detail.weapons[2].id);
    let weapon4 = weapon2txt(detail.weapons[3].id);
    let stageImage = 'https://splatoon2.ink/assets/splatnet' + detail.stage.image;

    const recruitBuffer = await recruitCanvas(recruit_num, count, host_user, user1, user2, condition);
    const recruit = new MessageAttachment(recruitBuffer, 'ikabu_recruit.png');

    const rule = new MessageAttachment(await ruleCanvas(date, coop_stage, weapon1, weapon2, weapon3, weapon4, stageImage), 'schedule.png');

    try {
        const sentMessage = await channel.send({
            content: txt,
            files: [recruit, rule],
        });

        // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
        sentMessage.edit({ components: [recruitDeleteButton(sentMessage, host_user)] });

        await interaction.editReply({
            content: '募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！',
            ephemeral: true,
        });

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

    let league_icon = await Canvas.loadImage('https://splatoon2.ink/assets/img/salmon-run-mini.aee5e8.png');
    recruit_ctx.drawImage(league_icon, 22, 35, 80, 52.8);

    recruit_ctx.font = '50px Splatfont';
    recruit_ctx.fillStyle = '#FF5600';
    recruit_ctx.fillText('サーモンラン', 115, 80);
    recruit_ctx.strokeStyle = '#FFFFFF';
    recruit_ctx.lineWidth = 2.5;
    recruit_ctx.strokeText('サーモンラン', 115, 80);

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
    if (count >= 3) {
        let user2_img = await Canvas.loadImage(user2_url);
        recruit_ctx.save();
        drawArcImage(recruit_ctx, user2_img, 276, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();
    }

    if (count == 4) {
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
async function ruleCanvas(date, stage, weapon1, weapon2, weapon3, weapon4, stageImage) {
    const ruleCanvas = Canvas.createCanvas(720, 550);
    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    rule_ctx.font = '32px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText('日時', 35, 80);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText('日時', 35, 80);

    date_width = rule_ctx.measureText(date).width;
    rule_ctx.font = '37px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(date, (650 - date_width) / 2, 145); // 中央寄せ
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(date, (650 - date_width) / 2, 145);

    rule_ctx.font = '32px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText('武器', 35, 245);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText('武器', 35, 245);

    rule_ctx.save();
    if (weapon1 === '❓') {
        weapon1 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons1_width = rule_ctx.measureText(weapon1).width;
    rule_ctx.fillText(weapon1, (350 - weapons1_width) / 2, 310);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon1, (350 - weapons1_width) / 2, 310);
    rule_ctx.restore();

    rule_ctx.save();
    if (weapon2 === '❓') {
        weapon2 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons2_width = rule_ctx.measureText(weapon2).width;
    rule_ctx.fillText(weapon2, (350 - weapons2_width) / 2, 375);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon2, (350 - weapons2_width) / 2, 375);
    rule_ctx.restore();

    rule_ctx.save();
    if (weapon3 === '❓') {
        weapon3 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons3_width = rule_ctx.measureText(weapon3).width;
    rule_ctx.fillText(weapon3, (350 - weapons3_width) / 2, 440);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon3, (350 - weapons3_width) / 2, 440);
    rule_ctx.restore();

    rule_ctx.save();
    if (weapon4 === '❓') {
        weapon4 = '？';
        rule_ctx.font = '41px "Splatfont"';
        rule_ctx.fillStyle = '#FFDB26';
    } else {
        rule_ctx.font = '33px "Splatfont"';
        rule_ctx.fillStyle = '#FFFFFF';
    }
    weapons4_width = rule_ctx.measureText(weapon4).width;
    rule_ctx.fillText(weapon4, (350 - weapons4_width) / 2, 505);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(weapon4, (350 - weapons4_width) / 2, 505);
    rule_ctx.restore();

    rule_ctx.font = '33px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText('ステージ', 350, 245);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText('ステージ', 350, 245);

    stage_width = rule_ctx.measureText(stage).width;
    rule_ctx.font = '38px "Splatfont"';
    rule_ctx.fillStyle = '#FFFFFF';
    rule_ctx.fillText(stage, 150 + (700 - stage_width) / 2, 300);
    rule_ctx.strokeStyle = '#2D3130';
    rule_ctx.lineWidth = 1.0;
    rule_ctx.strokeText(stage, 150 + (700 - stage_width) / 2, 300);

    let stage_img = await Canvas.loadImage(stageImage);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 340, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage_img, 370, 340, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
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
