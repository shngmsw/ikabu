const Canvas = require('canvas');

Canvas.registerFont('./fonts/Splatfont.ttf', { family: 'Splatfont' });
Canvas.registerFont('./fonts/NotoSansJP-Black.otf', { family: 'NotoSans' });

/**
 * canvasを用いた募集
 * @param {*} title ['タイトル', 'カラーコード1', 'カラーコード2']
 * @param {*} icon ['icon_url', XPosition, YPosition, width, height]
 * @param {*} date '日付'
 * @param {*} subtitle 'サブタイトル'
 * @param {*} thumbnail ['thumbnail_url', thumbnailXPosition, thumbnailYPosition, thumbScaleX, thumbScaleY]
 * @param {*} stage 'ステージ'
 * @param {*} condition '参加条件'
 * @returns canvas buffer
 */
module.exports.recruitCanvas = async function (title, icon, date, subtitle, thumbnail, stage, condition) {
    const recruitCanvas = Canvas.createCanvas(720, 550);
    const recruitCtx = recruitCanvas.getContext('2d');

    createRoundRect(recruitCtx, 1, 1, 718, 548, 30);
    recruitCtx.fillStyle = '#2F3136';
    recruitCtx.fill();

    var icon_img = await Canvas.loadImage(icon[0]);
    recruitCtx.drawImage(icon_img, icon[1], icon[2], icon[3], icon[4]);

    recruitCtx.font = '50px Splatfont';
    recruitCtx.fillStyle = title[1];
    recruitCtx.fillText(title[0], 120, 80);
    recruitCtx.strokeStyle = title[2];
    recruitCtx.lineWidth = 1.5;
    recruitCtx.strokeText(title[0], 120, 80);

    recruitCtx.font = '36px NotoSans';
    recruitCtx.fillStyle = '#FFFFFF';
    recruitCtx.fillText(date, 40, 150);

    recruitCtx.font = '45px Splatfont';
    recruitCtx.fillStyle = '#FFFFFF';
    recruitCtx.fillText(subtitle, 40, 220);
    recruitCtx.strokeStyle = '#000000';
    recruitCtx.lineWidth = 2.0;
    recruitCtx.strokeText(subtitle, 40, 220);

    recruitCtx.save();
    recruitCtx.scale(thumbnail[3], thumbnail[4]);
    var rule = await Canvas.loadImage(thumbnail[0]);
    recruitCtx.drawImage(rule, thumbnail[1], thumbnail[2]);
    recruitCtx.restore();

    recruitCtx.font = '35px NotoSans';
    recruitCtx.fillStyle = '#FFFFFF';
    recruitCtx.fillText(stage, 80, 277);

    recruitCtx.font = '45px Splatfont';
    recruitCtx.fillStyle = '#FFFFFF';
    recruitCtx.fillText('参加条件', 40, 385);
    recruitCtx.strokeStyle = '#000000';
    recruitCtx.lineWidth = 2.0;
    recruitCtx.strokeText('参加条件', 40, 385);

    recruitCtx.font = '30px NotoSans';
    const width = 600;
    const size = 40;
    var column = [''];
    var line = 0;
    var text = condition.replace('{br}', '\n', 'gm');

    for (var i = 0; i < text.length; i++) {
        var char = text.charAt(i);

        if (char == '\n' || recruitCtx.measureText(column[line] + char).width > width) {
            line++;
            column[line] = '';
        } else {
            column[line] += char;
        }
    }

    if (column.length > 3) {
        column[2] += '…';
    }

    for (var j = 0; j < column.length; j++) {
        if (j < 3) {
            recruitCtx.fillText(column[j], 80, 430 + size * j);
        }
    }

    const recruit = recruitCanvas.toBuffer();
    return recruit;
};

module.exports.stageDoubleCanvas = async function (stageImages) {
    const stageCanvas = Canvas.createCanvas(720, 480);
    const stageCtx = stageCanvas.getContext('2d');

    createRoundRect(stageCtx, 1, 1, 718, 478, 30);
    stageCtx.clip();

    var stage1_img = await Canvas.loadImage(stageImages[0]);
    stageCtx.save();
    stageCtx.beginPath();
    stageCtx.moveTo(0, 0);
    stageCtx.lineTo(450, 0);
    stageCtx.lineTo(270, 480);
    stageCtx.lineTo(0, 480);
    stageCtx.lineTo(0, 0);
    stageCtx.closePath();
    stageCtx.clip();
    stageCtx.drawImage(stage1_img, 0, 0, 720, 480);
    stageCtx.restore();

    var stage2_img = await Canvas.loadImage(stageImages[1]);
    stageCtx.save();
    stageCtx.beginPath();
    stageCtx.moveTo(450, 0);
    stageCtx.lineTo(270, 480);
    stageCtx.lineTo(720, 480);
    stageCtx.lineTo(720, 0);
    stageCtx.lineTo(450, 0);
    stageCtx.closePath();
    stageCtx.clip();
    stageCtx.drawImage(stage2_img, 0, 0, 720, 480);
    stageCtx.restore();

    const stage = stageCanvas.toBuffer();
    return stage;
};

module.exports.stageCanvas = async function (stageImage) {
    const stageCanvas = Canvas.createCanvas(720, 480);
    const stageCtx = stageCanvas.getContext('2d');

    createRoundRect(stageCtx, 1, 1, 718, 478, 30);
    stageCtx.clip();

    var stage_img = await Canvas.loadImage(stageImage);
    stageCtx.drawImage(stage_img, 0, 0, 720, 480);

    const stage = stageCanvas.toBuffer();
    return stage;
};

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
