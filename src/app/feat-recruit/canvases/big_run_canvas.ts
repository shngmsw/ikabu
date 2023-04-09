import Canvas from 'canvas';
import { modalRecruit } from '../../../constant.js';
import { log4js_obj } from '../../../log4js_settings';
import { getBigRunData } from '../../common/apis/splatoon3_ink';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';
import { Participant } from '../../../db/model/participant.js';

const logger = log4js_obj.getLogger('recruit');

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
export async function recruitBigRunCanvas(
    remaining: number,
    count: number,
    host: Participant,
    user1: Participant | null,
    user2: Participant | null,
    user3: Participant | null,
    condition: string,
    channelName: string,
) {
    try {
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

        const bigRunLogo = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/BIGRUN_logo.png');
        recruitCtx.drawImage(bigRunLogo, 25, 32, 400, 60);

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
    } catch (error) {
        logger.error(error);
    }
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
export async function ruleBigRunCanvas(data: $TSFixMe) {
    try {
        const salmonData = await getBigRunData(data, 0);
        if (salmonData == null) return null;

        const datetime =
            formatDatetime(salmonData.startTime, dateformat.mdwhm) + ' - ' + formatDatetime(salmonData.endTime, dateformat.mdwhm);

        const ruleCanvas = Canvas.createCanvas(720, 550);
        const ruleCtx = ruleCanvas.getContext('2d');

        createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
        ruleCtx.fillStyle = '#2F3136';
        ruleCtx.fill();
        ruleCtx.strokeStyle = '#FFFFFF';
        ruleCtx.lineWidth = 4;
        ruleCtx.stroke();

        fillTextWithStroke(ruleCtx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 60);

        const dateWidth = ruleCtx.measureText(datetime).width;
        fillTextWithStroke(ruleCtx, datetime, '37px Splatfont', '#FFFFFF', '#2D3130', 1, (650 - dateWidth) / 2, 120);

        fillTextWithStroke(ruleCtx, '武器', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 180);

        const weapon1Image = await Canvas.loadImage(salmonData.weapon1);
        ruleCtx.drawImage(weapon1Image, 50, 205, 85, 85);

        const weapon2Image = await Canvas.loadImage(salmonData.weapon2);
        ruleCtx.drawImage(weapon2Image, 150, 205, 85, 85);

        const weapon3Image = await Canvas.loadImage(salmonData.weapon3);
        ruleCtx.drawImage(weapon3Image, 50, 305, 85, 85);

        const weapon4Image = await Canvas.loadImage(salmonData.weapon4);
        ruleCtx.drawImage(weapon4Image, 150, 305, 85, 85);

        fillTextWithStroke(ruleCtx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 310, 180);

        const stageWidth = ruleCtx.measureText(salmonData.stage).width;
        fillTextWithStroke(ruleCtx, salmonData.stage, '38px Splatfont', '#FFFFFF', '#2D3130', 1, 110 + (700 - stageWidth) / 2, 235);

        const illust = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/BIGRUN_illust.png');
        ruleCtx.drawImage(illust, 380, 240, 330, 160);

        ruleCtx.save();
        ruleCtx.beginPath();
        ruleCtx.rect(240, 410, 250, 135);
        ruleCtx.clip();
        const stageImage = await Canvas.loadImage(salmonData.stageImage);
        ruleCtx.drawImage(stageImage, 240, 410, 250, 135);
        ruleCtx.restore();

        ruleCtx.save();
        ruleCtx.beginPath();
        createRoundRect(ruleCtx, 1, 1, 718, 548, 30);
        ruleCtx.clip();
        const bigRunFotter = await Canvas.loadImage(
            'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/BIGRUN_footer.png',
        );
        ruleCtx.drawImage(bigRunFotter, -5, 400, 730, 160);
        ruleCtx.restore();

        const rule = ruleCanvas.toBuffer();
        return rule;
    } catch (error) {
        logger.error(error);
    }
}
