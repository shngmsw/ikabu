import Canvas from 'canvas';
import path from 'path';
import { modalRecruit } from '../../../constant';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';

Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), {
    family: 'Splatfont',
});
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Medium.ttf'), {
    family: 'Genshin',
});
Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), {
    family: 'Genshin-Bold',
});
Canvas.registerFont(path.resolve('./fonts/SEGUISYM.TTF'), { family: 'SEGUI' });

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
export async function recruitAnarchyCanvas(
    recruit_num: $TSFixMe,
    count: $TSFixMe,
    host_member: $TSFixMe,
    user1: $TSFixMe,
    user2: $TSFixMe,
    condition: $TSFixMe,
    rank: $TSFixMe,
    channel_name: $TSFixMe,
) {
    const blank_avatar_url = 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/blank_avatar.png'; // blankのアバター画像URL

    const recruitCanvas = Canvas.createCanvas(720, 550);
    const recruit_ctx = recruitCanvas.getContext('2d');

    // 下地
    createRoundRect(recruit_ctx, 1, 1, 718, 548, 30);
    recruit_ctx.fillStyle = '#2F3136';
    recruit_ctx.fill();
    recruit_ctx.strokeStyle = '#FFFFFF';
    recruit_ctx.lineWidth = 4;
    recruit_ctx.stroke();

    const anarchy_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png');
    recruit_ctx.drawImage(anarchy_icon, 18, 15, 86, 86);

    fillTextWithStroke(recruit_ctx, 'バンカラマッチ', '51px Splatfont', '#000000', '#F14400', 3, 115, 80);

    // 募集主の画像
    const host_img = await Canvas.loadImage(host_member.displayAvatarURL({ extension: 'png' }));
    recruit_ctx.save();
    drawArcImage(recruit_ctx, host_img, 40, 120, 50);
    recruit_ctx.strokeStyle = '#1e1f23';
    recruit_ctx.lineWidth = 9;
    recruit_ctx.stroke();
    recruit_ctx.restore();

    const member_urls = [];

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

    for (let i = 0; i < 4; i++) {
        if (count >= i + 2) {
            const user_url = member_urls[i] != null ? member_urls[i] : blank_avatar_url;
            const user_img = await Canvas.loadImage(user_url);
            recruit_ctx.save();
            drawArcImage(recruit_ctx, user_img, i * 118 + 158, 120, 50);
            recruit_ctx.strokeStyle = '#1e1f23';
            recruit_ctx.lineWidth = 9;
            recruit_ctx.stroke();
            recruit_ctx.restore();
        }
    }

    const host_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
    recruit_ctx.drawImage(host_icon, 0, 0, host_icon.width, host_icon.height, 90, 172, 75, 75);

    fillTextWithStroke(recruit_ctx, '募集人数', '39px "Splatfont"', '#FFFFFF', '#2D3130', 1, 525, 155);

    fillTextWithStroke(recruit_ctx, '@' + recruit_num, '42px "Splatfont"', '#FFFFFF', '#2D3130', 1, 580, 218);

    fillTextWithStroke(recruit_ctx, '参加条件', '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 35, 290);

    recruit_ctx.font = '30px "Genshin", "SEGUI"';
    const width = 600;
    const size = 40;
    const column_num = 4;
    const column = [''];
    let line = 0;
    condition = condition.replace('{br}', '\n', 'gm');

    // 幅に合わせて自動改行
    for (let i = 0; i < condition.length; i++) {
        const char = condition.charAt(i);

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

    for (let j = 0; j < column.length; j++) {
        if (j < column_num) {
            recruit_ctx.fillText(column[j], 65, 345 + size * j);
        }
    }

    fillTextWithStroke(recruit_ctx, channel_name, '37px "Splatfont"', '#FFFFFF', '#2D3130', 1, 30, 520);

    recruit_ctx.save();
    recruit_ctx.textAlign = 'right';
    fillTextWithStroke(recruit_ctx, '募集ウデマエ: ' + rank, '38px "Splatfont"', '#FFFFFF', '#2D3130', 1, 690, 520);
    recruit_ctx.restore();

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
export async function ruleAnarchyCanvas(anarchy_data: $TSFixMe, thumbnail: $TSFixMe) {
    const ruleCanvas = Canvas.createCanvas(720, 550);

    const date = formatDatetime(anarchy_data.startTime, dateformat.ymdw);
    const time = formatDatetime(anarchy_data.startTime, dateformat.hm) + ' - ' + formatDatetime(anarchy_data.endTime, dateformat.hm);

    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    fillTextWithStroke(rule_ctx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    const rule_width = rule_ctx.measureText(anarchy_data.rule).width;
    fillTextWithStroke(rule_ctx, anarchy_data.rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - rule_width) / 2, 145); // 中央寄せ

    fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

    const date_width = rule_ctx.measureText(date).width;
    fillTextWithStroke(rule_ctx, date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - date_width) / 2, 270); // 中央寄せ

    const time_width = rule_ctx.measureText(time).width;
    fillTextWithStroke(rule_ctx, time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - time_width) / 2, 320); // 中央寄せ

    fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

    const stage1_width = rule_ctx.measureText(anarchy_data.stage1).width;
    fillTextWithStroke(rule_ctx, anarchy_data.stage1, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage1_width) / 2 + 10, 440); // 中央寄せ

    const stage2_width = rule_ctx.measureText(anarchy_data.stage2).width;
    fillTextWithStroke(rule_ctx, anarchy_data.stage2, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage2_width) / 2 + 10, 490); // 中央寄せ

    const stage1_img = await Canvas.loadImage(anarchy_data.stageImage1);
    rule_ctx.save();
    rule_ctx.beginPath();
    createRoundRect(rule_ctx, 370, 130, 308, 176, 10);
    rule_ctx.clip();
    rule_ctx.drawImage(stage1_img, 370, 130, 308, 176);
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 6.0;
    rule_ctx.stroke();
    rule_ctx.restore();

    const stage2_img = await Canvas.loadImage(anarchy_data.stageImage2);
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
