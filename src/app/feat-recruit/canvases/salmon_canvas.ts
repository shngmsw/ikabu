import Canvas from 'canvas';
import path from 'path';
import { modalRecruit } from '../../../constant.js';
import { getSalmonData } from '../../common/apis/splatoon3_ink';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';
import { Participant } from '../../../db/model/participant.js';

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
export async function recruitSalmonCanvas(
    remaining: number,
    count: number,
    host: Participant,
    user1: Participant | null,
    user2: Participant | null,
    user3: Participant | null,
    condition: string,
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

    const salmonIcon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png');
    recruitCtx.drawImage(salmonIcon, 22, 32, 82, 60);

    fillTextWithStroke(recruitCtx, 'SALMON', '51px Splatfont', '#000000', '#FF9900', 3, 115, 80);
    fillTextWithStroke(recruitCtx, 'RUN', '51px Splatfont', '#000000', '#00FF00DA', 3, 350, 80);

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

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
export async function ruleSalmonCanvas(data: $TSFixMe) {
    const salmonData = await getSalmonData(data, 0);

    const datetime = formatDatetime(salmonData.startTime, dateformat.mdwhm) + ' - ' + formatDatetime(salmonData.endTime, dateformat.mdwhm);

    const ruleCanvas = Canvas.createCanvas(720, 550);
    const ruleCtx = ruleCanvas.getContext('2d');

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.fillStyle = '#2F3136';
    ruleCtx.fill();
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 4;
    ruleCtx.stroke();

    fillTextWithStroke(ruleCtx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    const dateWidth = ruleCtx.measureText(datetime).width;
    fillTextWithStroke(ruleCtx, datetime, '37px Splatfont', '#FFFFFF', '#2D3130', 1, (650 - dateWidth) / 2, 145);

    fillTextWithStroke(ruleCtx, '武器', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 245);

    const weapon1Image = await Canvas.loadImage(salmonData.weapon1);
    ruleCtx.drawImage(weapon1Image, 50, 280, 110, 110);

    const weapon2Image = await Canvas.loadImage(salmonData.weapon2);
    ruleCtx.drawImage(weapon2Image, 190, 280, 110, 110);

    const weapon3Image = await Canvas.loadImage(salmonData.weapon3);
    ruleCtx.drawImage(weapon3Image, 50, 410, 110, 110);

    const weapon4Image = await Canvas.loadImage(salmonData.weapon4);
    ruleCtx.drawImage(weapon4Image, 190, 410, 110, 110);

    fillTextWithStroke(ruleCtx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 350, 245);

    const stageWidth = ruleCtx.measureText(salmonData.stage).width;
    fillTextWithStroke(ruleCtx, salmonData.stage, '38px Splatfont', '#FFFFFF', '#2D3130', 1, 150 + (700 - stageWidth) / 2, 300);

    const stageImage = await Canvas.loadImage(salmonData.stageImage);
    ruleCtx.save();
    ruleCtx.beginPath();
    createRoundRect(ruleCtx, 370, 340, 308, 176, 10);
    ruleCtx.clip();
    ruleCtx.drawImage(stageImage, 370, 340, 308, 176);
    ruleCtx.strokeStyle = '#FFFFFF';
    ruleCtx.lineWidth = 6.0;
    ruleCtx.stroke();
    ruleCtx.restore();

    createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
    ruleCtx.clip();

    const rule = ruleCanvas.toBuffer();
    return rule;
}
