const Canvas = require('canvas');

module.exports = {
    createRoundRect: createRoundRect,
    drawArcImage: drawArcImage,
};

/*
 角が丸い四角形を作成
 x,yは座標
 width,heightは幅と高さ
 radiusは角丸の半径
*/

/**
 * 角が丸い四角形を作成
 * @param {Canvas.CanvasRenderingContext2D} ctx Canvas Context
 * @param {*} x x座標
 * @param {*} y y座標
 * @param {*} width 幅
 * @param {*} height 高さ
 * @param {*} radius 角の半径サイズ
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

/**
 * 座標の位置に円形にクリップされた画像を表示
 * @param {Canvas.CanvasRenderingContext2D} ctx Canvas Context
 * @param {*} img 描写する画像
 * @param {*} xPosition x座標
 * @param {*} yPosition y座標
 * @param {*} radius 半径
 */
function drawArcImage(ctx, img, xPosition, yPosition, radius) {
    ctx.beginPath();
    ctx.arc(xPosition + radius, yPosition + radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height, xPosition, yPosition, radius * 2, radius * 2);
}
