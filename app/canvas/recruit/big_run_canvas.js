const Canvas = require('canvas');
const { createRoundRect, drawArcImage, fillTextWithStroke } = require('../../common/canvas_components');
const { getBigRunData } = require('../../common/apis/splatoon3_ink');
const { dateformat, formatDatetime } = require('../../common/convert_datetime');
const log4js = require('log4js');

module.exports = {
    recruitBigRunCanvas: recruitBigRunCanvas,
    ruleBigRunCanvas: ruleBigRunCanvas,
};

log4js.configure(process.env.LOG4JS_CONFIG_PATH);
const logger = log4js.getLogger('recruit');

/*
 * 募集用のキャンバス(1枚目)を作成する
 */
async function recruitBigRunCanvas(recruit_num, count, host_member, user1, user2, condition, channel_name) {
    try {
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

        let big_run_logo = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/BIGRUN_logo.png');
        recruit_ctx.drawImage(big_run_logo, 25, 32, 400, 60);

        // 募集主の画像
        let host_img = await Canvas.loadImage(host_member.displayAvatarURL({ extension: 'png' }));
        recruit_ctx.save();
        drawArcImage(recruit_ctx, host_img, 40, 120, 50);
        recruit_ctx.strokeStyle = '#1e1f23';
        recruit_ctx.lineWidth = 9;
        recruit_ctx.stroke();
        recruit_ctx.restore();

        let member_urls = [];

        if (user1 === 'dummy_icon') {
            member_urls.push(
                'http://placehold.jp/30/3d4070/ffffff/150x150.png?text=%E8%A1%A8%E7%A4%BA%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E5%8B%9F%E9%9B%86',
            );
        } else if (user1 != null) {
            member_urls.push(user1.displayAvatarURL({ extension: 'png' }));
        }

        if (user2 === 'dummy_icon') {
            member_urls.push(
                'http://placehold.jp/30/3d4070/ffffff/150x150.png?text=%E8%A1%A8%E7%A4%BA%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E5%8B%9F%E9%9B%86',
            );
        } else if (user2 != null) {
            member_urls.push(user2.displayAvatarURL({ extension: 'png' }));
        }

        for (let i = 0; i < 4; i++) {
            if (count >= i + 2) {
                let user_url = member_urls[i] != null ? member_urls[i] : blank_avatar_url;
                let user_img = await Canvas.loadImage(user_url);
                recruit_ctx.save();
                drawArcImage(recruit_ctx, user_img, i * 118 + 158, 120, 50);
                recruit_ctx.strokeStyle = '#1e1f23';
                recruit_ctx.lineWidth = 9;
                recruit_ctx.stroke();
                recruit_ctx.restore();
            }
        }

        let host_icon = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/squid.png');
        recruit_ctx.drawImage(host_icon, 0, 0, host_icon.width, host_icon.height, 90, 172, 75, 75);

        fillTextWithStroke(recruit_ctx, '募集人数', '39px "Splatfont"', '#FFFFFF', '#2D3130', 1, 525, 155);

        fillTextWithStroke(recruit_ctx, '@' + recruit_num, '42px "Splatfont"', '#FFFFFF', '#2D3130', 1, 580, 218);

        fillTextWithStroke(recruit_ctx, '参加条件', '43px "Splatfont"', '#FFFFFF', '#2D3130', 1, 35, 290);

        recruit_ctx.font = '30px "Genshin", "SEGUI"';
        const width = 600;
        const size = 40;
        const column_num = 4;
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
                recruit_ctx.fillText(column[j], 65, 345 + size * j);
            }
        }

        fillTextWithStroke(recruit_ctx, channel_name, '37px "Splatfont"', '#FFFFFF', '#2D3130', 1, 30, 520);

        const recruit = recruitCanvas.toBuffer();
        return recruit;
    } catch (error) {
        logger.error(error);
    }
}

/*
 * ルール情報のキャンバス(2枚目)を作成する
 */
async function ruleBigRunCanvas(data) {
    try {
        const salmon_data = await getBigRunData(data, 0);

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

        fillTextWithStroke(rule_ctx, '日時', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 60);

        date_width = rule_ctx.measureText(datetime).width;
        fillTextWithStroke(rule_ctx, datetime, '37px Splatfont', '#FFFFFF', '#2D3130', 1, (650 - date_width) / 2, 120);

        fillTextWithStroke(rule_ctx, '武器', '32px Splatfont', '#FFFFFF', '#2D3130', 1, 35, 180);

        let weapon1_img = await Canvas.loadImage(salmon_data.weapon1);
        rule_ctx.drawImage(weapon1_img, 50, 205, 85, 85);

        let weapon2_img = await Canvas.loadImage(salmon_data.weapon2);
        rule_ctx.drawImage(weapon2_img, 150, 205, 85, 85);

        let weapon3_img = await Canvas.loadImage(salmon_data.weapon3);
        rule_ctx.drawImage(weapon3_img, 50, 305, 85, 85);

        let weapon4_img = await Canvas.loadImage(salmon_data.weapon4);
        rule_ctx.drawImage(weapon4_img, 150, 305, 85, 85);

        fillTextWithStroke(rule_ctx, 'ステージ', '33px Splatfont', '#FFFFFF', '#2D3130', 1, 310, 180);

        stage_width = rule_ctx.measureText(salmon_data.stage).width;
        fillTextWithStroke(rule_ctx, salmon_data.stage, '38px Splatfont', '#FFFFFF', '#2D3130', 1, 110 + (700 - stage_width) / 2, 235);

        let illust = await Canvas.loadImage('https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/BIGRUN_illust.png');
        rule_ctx.drawImage(illust, 380, 240, 330, 160);

        rule_ctx.save();
        rule_ctx.beginPath();
        rule_ctx.rect(240, 410, 250, 135);
        rule_ctx.clip();
        let stage_img = await Canvas.loadImage(salmon_data.stageImage);
        rule_ctx.drawImage(stage_img, 240, 410, 250, 135);
        rule_ctx.restore();

        rule_ctx.save();
        rule_ctx.beginPath();
        createRoundRect(rule_ctx, 1, 1, 718, 548, 30);
        rule_ctx.clip();
        let big_run_fotter = await Canvas.loadImage(
            'https://raw.githubusercontent.com/shngmsw/ikabu/main/images/recruit/BIGRUN_footer.png',
        );
        rule_ctx.drawImage(big_run_fotter, -5, 400, 730, 160);
        rule_ctx.restore();

        const rule = ruleCanvas.toBuffer();
        return rule;
    } catch (error) {
        logger.error(error);
    }
}
