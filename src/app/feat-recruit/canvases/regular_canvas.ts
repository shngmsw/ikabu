// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Canvas'.
const Canvas = require('canvas');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createRoun... Remove this comment to see the full error message
const { createRoundRect, drawArcImage, fillTextWithStroke } = require('../../common/canvas_components');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dateformat... Remove this comment to see the full error message
const { dateformat, formatDatetime } = require('../../common/convert_datetime');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'modalRecru... Remove this comment to see the full error message
const { modalRecruit } = require('../../../constant.js');

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    recruitRegularCanvas: recruitRegularCanvas,
    ruleRegularCanvas: ruleRegularCanvas,
};

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), { family: 'Splatfont' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), { family: 'Genshin' });
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), { family: 'Genshin-Bold' });
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'recruitReg... Remove this comment to see the full error message
async function recruitRegularCanvas(recruit_num: $TSFixMe, count: $TSFixMe, host_member: $TSFixMe, user1: $TSFixMe, user2: $TSFixMe, user3: $TSFixMe, condition: $TSFixMe, channel_name: $TSFixMe) {
    // @ts-expect-error TS(2304): Cannot find name 'blank_avatar_url'.
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

    let regular_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png');
    recruit_ctx.drawImage(regular_icon, 25, 25, 75, 75);

    fillTextWithStroke(recruit_ctx, 'レギュラーマッチ', '51px Splatfont', '#000000', '#B3FF00', 3, 115, 80);

    let member_urls = [];

    if (user1 === 'dummy_icon') {
        member_urls.push(modalRecruit.placeHold);
    } else if (user1 != null) {
        member_urls.push(user1.displayAvatarURL({ extension: 'png' }));
    }

    if (user2 === 'dummy_icon') {
        member_urls.push(modalRecruit.placeHold);
    } else if (user2 != null) {
        member_urls.push(user2.displayAvatarURL({ extension: 'png' }));
    }

    if (user3 === 'dummy_icon') {
        member_urls.push(modalRecruit.placeHold);
    } else if (user3 != null) {
        member_urls.push(user3.displayAvatarURL({ extension: 'png' }));
    }

    // 募集主の画像
    let host_img = await Canvas.loadImage(host_member.displayAvatarURL({ extension: 'png' }));
    recruit_ctx.save();
    drawArcImage(recruit_ctx, host_img, 40, 120, 40);
    recruit_ctx.strokeStyle = '#1e1f23';
    recruit_ctx.lineWidth = 9;
    recruit_ctx.stroke();
    recruit_ctx.restore();

    for (let i = 0; i < 7; i++) {
        if (count >= i + 2) {
            // @ts-expect-error TS(2304): Cannot find name 'blank_avatar_url'.
            let user_url = member_urls[i] != null ? member_urls[i] : blank_avatar_url;
            let user_img = await Canvas.loadImage(user_url);
            recruit_ctx.save();
            if (i < 3) {
                drawArcImage(recruit_ctx, user_img, (i + 1) * 100 + 40, 120, 40);
            } else {
                drawArcImage(recruit_ctx, user_img, (i - 3) * 100 + 40, 220, 40);
            }
            recruit_ctx.strokeStyle = '#1e1f23';
            recruit_ctx.lineWidth = 9;
            recruit_ctx.stroke();
            recruit_ctx.restore();
        }
    }

    let host_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
    recruit_ctx.drawImage(host_icon, 0, 0, host_icon.width, host_icon.height, 75, 155, 75, 75);

    recruit_ctx.save();
    recruit_ctx.textAlign = 'right';
    fillTextWithStroke(recruit_ctx, channel_name, '33px "Splatfont"', '#FFFFFF', '#2D3130', 1, 680, 70);
    recruit_ctx.restore();

    fillTextWithStroke(recruit_ctx, '募集人数', '41px "Splatfont"', '#FFFFFF', '#2D3130', 1, 490, 185);

    fillTextWithStroke(recruit_ctx, '@' + recruit_num, '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 535, 248);

    fillTextWithStroke(recruit_ctx, '参加条件', '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 35, 360);

    recruit_ctx.font = '31px "Genshin", "SEGUI"';
    const width = 603;
    const size = 40;
    const column_num = 3;
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

    if (column.length > column_num) {
        column[column_num - 1] += '…';
    }

    for (var j = 0; j < column.length; j++) {
        if (j < column_num) {
            recruit_ctx.fillText(column[j], 65, 415 + size * j);
        }
    }

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ruleRegula... Remove this comment to see the full error message
async function ruleRegularCanvas(regular_data: $TSFixMe) {
    const ruleCanvas = Canvas.createCanvas(720, 550);

    const date = formatDatetime(regular_data.startTime, dateformat.ymdw);
    const time = formatDatetime(regular_data.startTime, dateformat.hm) + ' - ' + formatDatetime(regular_data.endTime, dateformat.hm);

    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    fillTextWithStroke(rule_ctx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    // @ts-expect-error TS(2304): Cannot find name 'rule_width'.
    rule_width = rule_ctx.measureText(regular_data.rule).width;
    // @ts-expect-error TS(2304): Cannot find name 'rule_width'.
    fillTextWithStroke(rule_ctx, regular_data.rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - rule_width) / 2, 145); // 中央寄せ

    fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

    // @ts-expect-error TS(2304): Cannot find name 'date_width'.
    date_width = rule_ctx.measureText(date).width;
    // @ts-expect-error TS(2304): Cannot find name 'date_width'.
    fillTextWithStroke(rule_ctx, date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - date_width) / 2, 270); // 中央寄せ

    // @ts-expect-error TS(2304): Cannot find name 'time_width'.
    time_width = rule_ctx.measureText(time).width;
    // @ts-expect-error TS(2304): Cannot find name 'time_width'.
    fillTextWithStroke(rule_ctx, time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - time_width) / 2, 320); // 中央寄せ

    fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

    // @ts-expect-error TS(2304): Cannot find name 'stage1_width'.
    stage1_width = rule_ctx.measureText(regular_data.stage1).width;
    // @ts-expect-error TS(2304): Cannot find name 'stage1_width'.
    fillTextWithStroke(rule_ctx, regular_data.stage1, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage1_width) / 2 + 10, 440); // 中央寄せ

    // @ts-expect-error TS(2304): Cannot find name 'stage2_width'.
    stage2_width = rule_ctx.measureText(regular_data.stage2).width;
    // @ts-expect-error TS(2304): Cannot find name 'stage2_width'.
    fillTextWithStroke(rule_ctx, regular_data.stage2, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage2_width) / 2 + 10, 490); // 中央寄せ

    let stage1_img = await Canvas.loadImage(regular_data.stageImage1);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 130, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage1_img, 370, 130, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    let stage2_img = await Canvas.loadImage(regular_data.stageImage2);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 340, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage2_img, 370, 340, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}
