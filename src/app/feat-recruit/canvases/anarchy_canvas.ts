import Canvas from 'canvas';
import path from 'path';
import { modalRecruit } from '../../../constant';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';
import { Participant } from '../../../db/model/participant';

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
    remaining: number,
    count: number,
    host: Participant,
    user1: Participant | null,
    user2: Participant | null,
    user3: Participant | null,
    condition: string,
    rank: string,
    channelName: string,
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

    const anarchyIcon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/anarchy_icon.png');
    recruitCtx.drawImage(anarchyIcon, 18, 15, 86, 86);

    fillTextWithStroke(recruitCtx, 'バンカラマッチ', '51px Splatfont', '#000000', '#F14400', 3, 115, 80);

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
            const userUrl = memberIcons[i] != null ? memberIcons[i] : blankAvatarUrl;
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

    fillTextWithStroke(recruitCtx, '@' + remaining, '42px "Splatfont"', '#FFFFFF', '#2D3130', 1, 580, 218);

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

    fillTextWithStroke(recruitCtx, channelName, '37px "Splatfont"', '#FFFFFF', '#2D3130', 1, 30, 520);

    recruitCtx.save();
    recruitCtx.textAlign = 'right';
    fillTextWithStroke(recruitCtx, '募集ウデマエ: ' + rank, '38px "Splatfont"', '#FFFFFF', '#2D3130', 1, 690, 520);
    recruitCtx.restore();

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
export async function ruleAnarchyCanvas(anarchyData: $TSFixMe, thumbnail: $TSFixMe) {
    const ruleCanvas = Canvas.createCanvas(720, 550);

    const date = formatDatetime(anarchyData.startTime, dateformat.ymdw);
    const time = formatDatetime(anarchyData.startTime, dateformat.hm) + ' - ' + formatDatetime(anarchyData.endTime, dateformat.hm);

    const ruleCtx = ruleCanvas.getContext('2d');

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.fillStyle = '#2F3136';
    ruleCtx.fill();
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 4;
    ruleCtx.stroke();

    fillTextWithStroke(ruleCtx, 'ルール', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    const ruleWidth = ruleCtx.measureText(anarchyData.rule).width;
    fillTextWithStroke(ruleCtx, anarchyData.rule, '45px Splatfont', '#FFFFFF', '#2D3130', 1, (320 - ruleWidth) / 2, 145); // 中央寄せ

    fillTextWithStroke(ruleCtx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 220);

    const dateWidth = ruleCtx.measureText(date).width;
    fillTextWithStroke(ruleCtx, date, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - dateWidth) / 2, 270); // 中央寄せ

    const timeWidth = ruleCtx.measureText(time).width;
    fillTextWithStroke(ruleCtx, time, '35px Splatfont', '#FFFFFF', '#2D3130', 1, 15 + (350 - timeWidth) / 2, 320); // 中央寄せ

    fillTextWithStroke(ruleCtx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 390);

    const stage1Width = ruleCtx.measureText(anarchyData.stage1).width;
    fillTextWithStroke(ruleCtx, anarchyData.stage1, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage1Width) / 2 + 10, 440); // 中央寄せ

    const stage2Width = ruleCtx.measureText(anarchyData.stage2).width;
    fillTextWithStroke(ruleCtx, anarchyData.stage2, '35px Splatfont', '#FFFFFF', '#2D3130', 1, (350 - stage2Width) / 2 + 10, 490); // 中央寄せ

    const stage1Image = await Canvas.loadImage(anarchyData.stageImage1);
    ruleCtx.save();
    ruleCtx.beginPath();
    createRoundRect(ruleCtx, 370, 130, 308, 176, 10);
    ruleCtx.clip();
    ruleCtx.drawImage(stage1Image, 370, 130, 308, 176);
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 6.0;
    ruleCtx.stroke();
    ruleCtx.restore();

    const stage2Image = await Canvas.loadImage(anarchyData.stageImage2);
    ruleCtx.save();
    ruleCtx.beginPath();
    createRoundRect(ruleCtx, 370, 340, 308, 176, 10);
    ruleCtx.clip();
    ruleCtx.drawImage(stage2Image, 370, 340, 308, 176);
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 6.0;
    ruleCtx.stroke();
    ruleCtx.restore();

    ruleCtx.save();
    const ruleImage = await Canvas.loadImage(thumbnail[0]);
    ruleCtx.drawImage(ruleImage, 0, 0, ruleImage.width, ruleImage.height, thumbnail[1], thumbnail[2], thumbnail[3], thumbnail[4]);
    ruleCtx.restore();

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}
