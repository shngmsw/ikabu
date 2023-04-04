import Canvas from 'canvas';
import path from 'path';
import { modalRecruit } from '../../../constant.js';
import { getSalmonData } from '../../common/apis/splatoon3_ink';
import { createRoundRect, drawArcImage, fillTextWithStroke } from '../../common/canvas_components';
import { dateformat, formatDatetime } from '../../common/convert_datetime';
import { GuildMember, User } from 'discord.js';

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
    recruit_num: number,
    count: number,
    host_member: GuildMember,
    user1: User | GuildMember | string | null,
    user2: User | GuildMember | string | null,
    condition: string,
    channel_name: string,
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

    const salmon_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/salmon_black_icon.png');
    recruit_ctx.drawImage(salmon_icon, 22, 32, 82, 60);

    fillTextWithStroke(recruit_ctx, 'SALMON', '51px Splatfont', '#000000', '#FF9900', 3, 115, 80);
    fillTextWithStroke(recruit_ctx, 'RUN', '51px Splatfont', '#000000', '#00FF00DA', 3, 350, 80);

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
    } else if (user1 instanceof User || user1 instanceof GuildMember) {
        member_urls.push(user1.displayAvatarURL({ extension: 'png' }));
    }

    if (user2 === 'dummy_icon') {
        member_urls.push(modalRecruit.placeHold);
    } else if (user2 instanceof User || user2 instanceof GuildMember) {
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
    condition = condition.replace('{br}', '\n');

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

    const recruit = recruitCanvas.toBuffer();
    return recruit;
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
export async function ruleSalmonCanvas(data: $TSFixMe) {
    const salmon_data = await getSalmonData(data, 0);

    const datetime =
        formatDatetime(salmon_data.startTime, dateformat.mdwhm) + ' - ' + formatDatetime(salmon_data.endTime, dateformat.mdwhm);

    const ruleCanvas = Canvas.createCanvas(720, 550);
    const rule_ctx = ruleCanvas.getContext('2d');

    createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
    rule_ctx.fillStyle = '#2F3136';
    rule_ctx.fill();
    rule_ctx.strokeStyle = '#FFFFFF';
    rule_ctx.lineWidth = 4;
    rule_ctx.stroke();

    fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 80);

    const date_width = rule_ctx.measureText(datetime).width;
    fillTextWithStroke(rule_ctx, datetime, '37px Splatfont', '#FFFFFF', '#2D3130', 1, (650 - date_width) / 2, 145);

    fillTextWithStroke(rule_ctx, '武器', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 245);

    const weapon1_img = await Canvas.loadImage(salmon_data.weapon1);
    rule_ctx.drawImage(weapon1_img, 50, 280, 110, 110);

    const weapon2_img = await Canvas.loadImage(salmon_data.weapon2);
    rule_ctx.drawImage(weapon2_img, 190, 280, 110, 110);

    const weapon3_img = await Canvas.loadImage(salmon_data.weapon3);
    rule_ctx.drawImage(weapon3_img, 50, 410, 110, 110);

    const weapon4_img = await Canvas.loadImage(salmon_data.weapon4);
    rule_ctx.drawImage(weapon4_img, 190, 410, 110, 110);

    fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 350, 245);

    const stage_width = rule_ctx.measureText(salmon_data.stage).width;
    fillTextWithStroke(rule_ctx, salmon_data.stage, '38px Splatfont', '#FFFFFF', '#2D3130', 1, 150 + (700 - stage_width) / 2, 300);

    const stage_img = await Canvas.loadImage(salmon_data.stageImage);
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
