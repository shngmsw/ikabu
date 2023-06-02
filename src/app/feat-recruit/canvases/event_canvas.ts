import Canvas from 'canvas';
import path from 'path';
import { modalRecruit } from '../../../constant';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';
import { Participant } from '../../../db/model/participant';
import { RecruitOpCode } from './regenerate_canvas';
import { notExists } from '../../common/others';
import { EventMatchInfo } from '../../common/apis/splatoon3_ink';

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
export async function recruitEventCanvas(
    opCode: number,
    remaining: number,
    count: number,
    host: Participant,
    user1: Participant | null,
    user2: Participant | null,
    user3: Participant | null,
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

    const eventIcon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/event_icon.png');
    recruitCtx.drawImage(eventIcon, 19, 19, 77, 77);

    fillTextWithStroke(recruitCtx, 'イベントマッチ', '51px Splatfont', '#000000', '#FF2F82', 3, 112, 80);

    // 募集主の画像
    const hostImage = await Canvas.loadImage(host.iconUrl ?? modalRecruit.placeHold);
    recruitCtx.save();
    drawArcImage(recruitCtx, hostImage, 40, 120, 50);
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

    for (let i = 0; i < 4; i++) {
        if (count >= i + 2) {
            const userUrl = memberIcons[i] ?? blankAvatarUrl;
            const userImage = await Canvas.loadImage(userUrl);
            recruitCtx.save();
            drawArcImage(recruitCtx, userImage, i * 118 + 158, 120, 50);
            recruitCtx.strokeStyle = '#1e1f23';
            recruitCtx.lineWidth = 9;
            recruitCtx.stroke();
            recruitCtx.restore();
        }
    }

    const hostIcon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
    recruitCtx.drawImage(hostIcon, 0, 0, hostIcon.width, hostIcon.height, 90, 172, 75, 75);

    fillTextWithStroke(recruitCtx, '募集人数', '39px "Splatfont"', '#FFFFFF', '#2D3130', 1, 525, 155);

    let remainingString;
    if (opCode === RecruitOpCode.open || opCode === RecruitOpCode.cancel) {
        remainingString = remaining > 0 ? '@' + remaining : '満員';
    } else if (opCode === RecruitOpCode.close) {
        remainingString = '受付終了';
    }

    recruitCtx.save();
    recruitCtx.textAlign = 'center';
    fillTextWithStroke(recruitCtx, remainingString, '42px "Splatfont"', '#FFFFFF', '#2D3130', 1, 605, 218);
    recruitCtx.restore();

    fillTextWithStroke(recruitCtx, '参加条件', '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 35, 290);

    recruitCtx.font = '30px "Genshin", "SEGUI"';
    const width = 600;
    const size = 40;
    const columnNum = 4;
    const column = [''];
    let line = 0;
    condition = condition.replace('{br}', '\n');

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
            recruitCtx.fillText(column[j], 65, 345 + size * j);
        }
    }

    let channelString;
    if (notExists(channelName)) {
        channelString = '🔉 VC指定なし';
    } else if (channelName === '[簡易版募集]') {
        channelString = channelName;
    } else {
        channelString = '🔉 ' + channelName;
    }

    fillTextWithStroke(recruitCtx, channelString, '37px "Splatfont"', '#FFFFFF', '#2D3130', 1, 30, 520);

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
export async function ruleEventCanvas(eventData: EventMatchInfo) {
    const ruleCanvas = Canvas.createCanvas(720, 550);

    const date = formatDatetime(eventData.startTime, dateformat.ymdw);
    const time = formatDatetime(eventData.startTime, dateformat.hm) + ' - ' + formatDatetime(eventData.endTime, dateformat.hm);

    const ruleCtx = ruleCanvas.getContext('2d');

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.fillStyle = '#2F3136';
    ruleCtx.fill();
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 4;
    ruleCtx.stroke();

    ruleCtx.save();
    ruleCtx.textAlign = 'right';
    fillTextWithStroke(ruleCtx, eventData.title, '38px Splatfont', '#FFE02EFB', '#2D3130', 1, 690, 65);
    ruleCtx.restore();

    fillTextWithStroke(ruleCtx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    const ruleWidth = ruleCtx.measureText(eventData.rule).width;
    fillTextWithStroke(ruleCtx, eventData.rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - ruleWidth) / 2, 145); // 中央寄せ

    fillTextWithStroke(ruleCtx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

    const dateWidth = ruleCtx.measureText(date).width;
    fillTextWithStroke(ruleCtx, date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - dateWidth) / 2, 270); // 中央寄せ

    const timeWidth = ruleCtx.measureText(time).width;
    fillTextWithStroke(ruleCtx, time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - timeWidth) / 2, 320); // 中央寄せ

    fillTextWithStroke(ruleCtx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

    ruleCtx.save();
    ruleCtx.textAlign = 'center';
    fillTextWithStroke(ruleCtx, eventData.stage1, '32px Splatfont', '#FFFFFF', '#2D3130', 1, 190, 440);
    fillTextWithStroke(ruleCtx, eventData.stage2, '32px Splatfont', '#FFFFFF', '#2D3130', 1, 190, 490);
    ruleCtx.restore();

    const stage1Image = await Canvas.loadImage(eventData.stageImage1);
    ruleCtx.save();
    ruleCtx.beginPath();
    createRoundRect(ruleCtx, 370, 130, 308, 176, 10);
    ruleCtx.clip();
    ruleCtx.drawImage(stage1Image, 370, 130, 308, 176);
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 6.0;
    ruleCtx.stroke();
    ruleCtx.restore();

    const stage2Image = await Canvas.loadImage(eventData.stageImage2);
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
