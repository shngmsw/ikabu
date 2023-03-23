import Canvas from "canvas";

/**
 *
 * @param {Canvas.CanvasRenderingContext2D} ctx Canvas Context
 * @param {String} text テキスト
 * @param {String} font_style フォントスタイル
 * @param {String} fill_color 塗りつぶしの色
 * @param {String} stroke_color フチの色
 * @param {float} strokeWidth フチの太さ
 * @param {float} x x座標
 * @param {float} y y座標
 */
export function fillTextWithStroke(
  ctx: $TSFixMe,
  text: $TSFixMe,
  font_style: $TSFixMe,
  fill_color: $TSFixMe,
  stroke_color: $TSFixMe,
  strokeWidth: $TSFixMe,
  x: $TSFixMe,
  y: $TSFixMe
) {
  ctx.font = font_style;
  ctx.fillStyle = fill_color;
  ctx.fillText(text, x, y);
  ctx.strokeStyle = stroke_color;
  ctx.lineWidth = strokeWidth;
  ctx.strokeText(text, x, y);
}
/**
 * 角が丸い四角形を作成
 * @param {Canvas.CanvasRenderingContext2D} ctx Canvas Context
 * @param {*} x x座標
 * @param {*} y y座標
 * @param {*} width 幅
 * @param {*} height 高さ
 * @param {*} radius 角の半径サイズ
 */
export function createRoundRect(
  ctx: $TSFixMe,
  x: $TSFixMe,
  y: $TSFixMe,
  width: $TSFixMe,
  height: $TSFixMe,
  radius: $TSFixMe
) {
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
export function drawArcImage(
  ctx: $TSFixMe,
  img: $TSFixMe,
  xPosition: $TSFixMe,
  yPosition: $TSFixMe,
  radius: $TSFixMe
) {
  ctx.beginPath();
  ctx.arc(xPosition + radius, yPosition + radius, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    xPosition,
    yPosition,
    radius * 2,
    radius * 2
  );
}
