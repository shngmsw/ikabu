import Canvas from 'canvas';
import path from 'path';
import { modalRecruit } from '../../../constant.js';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';
import { Participant } from '../../../db/model/participant.js';
import { RecruitOpCode } from './regenerate_canvas.js';
import { notExists } from '../../common/others.js';

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
export async function recruitRegularCanvas(
    opCode: number,
    remaining: number,
    count: number,
    host: Participant,
    user1: Participant | null,
    user2: Participant | null,
    user3: Participant | null,
    user4: Participant | null,
    user5: Participant | null,
    user6: Participant | null,
    user7: Participant | null,
    condition: string,
    channelName: string | null,
) {
    const blankAvatarUrl = 'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/blank_avatar.png'; // blankのアバター画像URL

    const recruitCanvas = Canvas.createCanvas(720, 550);
    const recruitCtx = recruitCanvas.getContext('2d');

    // 下地
    createRoundRect(recruitCtx, 1, 1, 718, 548, 30);
    recruitCtx.fillStyle = '#2F3136';
    recruitCtx.fill();
    recruitCtx.strokeStyle = '#FFFFFF';
    recruitCtx.lineWidth = 4;
    recruitCtx.stroke();

    const regularIcon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/regular_icon.png');
    recruitCtx.drawImage(regularIcon, 25, 25, 75, 75);

    fillTextWithStroke(recruitCtx, 'レギュラーマッチ', '51px Splatfont', '#000000', '#B3FF00', 3, 115, 80);

    // 募集主の画像
    const hostImage = await Canvas.loadImage(host.iconUrl ?? modalRecruit.placeHold);
    recruitCtx.save();
    drawArcImage(recruitCtx, hostImage, 40, 120, 40);
    recruitCtx.strokeStyle = '#1e1f23';
    recruitCtx.lineWidth = 9;
    recruitCtx.stroke();
    recruitCtx.restore();

    const memberIcons = [];

    if (user1 instanceof Participant) {
        memberIcons.push(user1.iconUrl ?? modalRecruit.placeHold);
    }

    if (user2 instanceof Participant) {
        memberIcons.push(user2.iconUrl ?? modalRecruit.placeHold);
    }

    if (user3 instanceof Participant) {
        memberIcons.push(user3.iconUrl ?? modalRecruit.placeHold);
    }

    if (user4 instanceof Participant) {
        memberIcons.push(user4.iconUrl ?? modalRecruit.placeHold);
    }

    if (user5 instanceof Participant) {
        memberIcons.push(user5.iconUrl ?? modalRecruit.placeHold);
    }

    if (user6 instanceof Participant) {
        memberIcons.push(user6.iconUrl ?? modalRecruit.placeHold);
    }

    if (user7 instanceof Participant) {
        memberIcons.push(user7.iconUrl ?? modalRecruit.placeHold);
    }

    for (let i = 0; i < 7; i++) {
        if (count >= i + 2) {
            const userUrl = memberIcons[i] ?? blankAvatarUrl;
            const userImage = await Canvas.loadImage(userUrl);
            recruitCtx.save();
            if (i < 3) {
                drawArcImage(recruitCtx, userImage, (i + 1) * 100 + 40, 120, 40);
            } else {
                drawArcImage(recruitCtx, userImage, (i - 3) * 100 + 40, 220, 40);
            }
            recruitCtx.strokeStyle = '#1e1f23';
            recruitCtx.lineWidth = 9;
            recruitCtx.stroke();
            recruitCtx.restore();
        }
    }

    const hostIcon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
    recruitCtx.drawImage(hostIcon, 0, 0, hostIcon.width, hostIcon.height, 75, 155, 75, 75);

    let channelString;
    if (notExists(channelName)) {
        channelString = '🔉 VC指定なし';
    } else if (channelName === '[簡易版募集]') {
        channelString = channelName;
    } else {
        channelString = '🔉 ' + channelName;
    }

    recruitCtx.save();
    recruitCtx.textAlign = 'right';
    fillTextWithStroke(recruitCtx, channelString, '33px "Splatfont"', '#FFFFFF', '#2D3130', 1, 680, 70);
    recruitCtx.restore();

    fillTextWithStroke(recruitCtx, '募集人数', '41px "Splatfont"', '#FFFFFF', '#2D3130', 1, 490, 185);

    let remainingString;
    if (opCode === RecruitOpCode.open || opCode === RecruitOpCode.cancel) {
        remainingString = remaining > 0 ? '@' + remaining : '満員';
    } else if (opCode === RecruitOpCode.close) {
        remainingString = '受付終了';
    } else {
        remainingString = 'ERROR!';
    }

    recruitCtx.save();
    recruitCtx.textAlign = 'center';
    fillTextWithStroke(recruitCtx, remainingString, '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 560, 248);
    recruitCtx.restore();

    fillTextWithStroke(recruitCtx, '参加条件', '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 35, 360);

    recruitCtx.font = '31px "Genshin", "SEGUI"';
    const width = 603;
    const size = 40;
    const columnNum = 3;
    const column = [''];
    let line = 0;
    condition = condition.replace(/\\n/g, '\n');

    // 幅に合わせて自動改行
    for (let i = 0; i < condition.length; i++) {
        const char = condition.charAt(i);

        if (char == '\n') {
            line++;
            column[line] = '';
        } else if (recruitCtx.measureText(column[line] + char).width > width) {
            line++;
            column[line] = char;
        } else {
            column[line] += char;
        }
    }

    if (column.length > columnNum) {
        column[columnNum - 1] += '…';
    }

    for (let j = 0; j < column.length; j++) {
        if (j < columnNum) {
            recruitCtx.fillText(column[j], 65, 415 + size * j);
        }
    }

    if (opCode === RecruitOpCode.cancel) {
        recruitCtx.save();
        recruitCtx.translate(220, -110);
        recruitCtx.rotate((25 * Math.PI) / 180);
        const cancelStamp = await Canvas.loadImage(
            'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/canceled_stamp.png',
        );
        recruitCtx.drawImage(cancelStamp, 0, 0, cancelStamp.width, cancelStamp.height, 0, 0, 600, 600);
        recruitCtx.restore;
    } else if (opCode === RecruitOpCode.close) {
        recruitCtx.save();
        const cancelStamp = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/closed_stamp.png');
        recruitCtx.drawImage(cancelStamp, 0, 0, cancelStamp.width, cancelStamp.height, 130, 80, 500, 340);
        recruitCtx.restore;
    }

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
export async function ruleRegularCanvas(regularData: $TSFixMe) {
    const ruleCanvas = Canvas.createCanvas(720, 550);

    const date = formatDatetime(regularData.startTime, dateformat.ymdw);
    const time = formatDatetime(regularData.startTime, dateformat.hm) + ' - ' + formatDatetime(regularData.endTime, dateformat.hm);

    const ruleCtx = ruleCanvas.getContext('2d');

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.fillStyle = '#2F3136';
    ruleCtx.fill();
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 4;
    ruleCtx.stroke();

    fillTextWithStroke(ruleCtx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    const ruleWidth = ruleCtx.measureText(regularData.rule).width;
    fillTextWithStroke(ruleCtx, regularData.rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - ruleWidth) / 2, 145); // 中央寄せ

    fillTextWithStroke(ruleCtx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

    const dateWidth = ruleCtx.measureText(date).width;
    fillTextWithStroke(ruleCtx, date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - dateWidth) / 2, 270); // 中央寄せ

    const timeWidth = ruleCtx.measureText(time).width;
    fillTextWithStroke(ruleCtx, time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - timeWidth) / 2, 320); // 中央寄せ

    fillTextWithStroke(ruleCtx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

    ruleCtx.save();
    ruleCtx.textAlign = 'center';
    fillTextWithStroke(ruleCtx, regularData.stage1, '32px Splatfont', '#FFFFFF', '#2D3130', 1, 190, 440);
    fillTextWithStroke(ruleCtx, regularData.stage2, '32px Splatfont', '#FFFFFF', '#2D3130', 1, 190, 490);
    ruleCtx.restore();

    const stage1Image = await Canvas.loadImage(regularData.stageImage1);
    ruleCtx.save();
    ruleCtx.beginPath();
    createRoundRect(ruleCtx, 370, 130, 308, 176, 10);
    ruleCtx.clip();
    ruleCtx.drawImage(stage1Image, 370, 130, 308, 176);
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 6.0;
    ruleCtx.stroke();
    ruleCtx.restore();

    const stage2Image = await Canvas.loadImage(regularData.stageImage2);
    ruleCtx.save();
    ruleCtx.beginPath();
    createRoundRect(ruleCtx, 370, 340, 308, 176, 10);
    ruleCtx.clip();
    ruleCtx.drawImage(stage2Image, 370, 340, 308, 176);
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 6.0;
    ruleCtx.stroke();
    ruleCtx.restore();

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}
