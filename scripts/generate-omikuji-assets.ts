import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createCanvas, registerFont } from 'canvas';
import ffmpeg from 'ffmpeg-static';

import { fortunes, omikujiAnimationDuration } from '../src/features/omikuji/fortunes';

// Bot の応答中にエンコードせず、同梱する素材だけを開発時に生成する。
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'images/omikuji');
registerFont(path.join(root, 'fonts/GenShinGothic-P-Bold.ttf'), {
    family: 'Omikuji',
    weight: 'bold',
});
registerFont(path.join(root, 'fonts/GenShinGothic-P-Medium.ttf'), {
    family: 'Omikuji',
    weight: 'normal',
});
const canvas = createCanvas(640, 400);
const ctx = canvas.getContext('2d');
const gold = '#e5b957';
const paper = '#fff3dc';
const fps = 20;

function text(value: string, x: number, y: number, size: number, color = paper, bold = false) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 'bold' : 'normal'} ${size}px Omikuji`;
    ctx.fillText(value, x, y);
}

function polygon(points: number[][], fill: string) {
    ctx.beginPath();
    points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

function star(x: number, y: number, size: number, color: string) {
    polygon(
        [
            [x, y - size],
            [x + size * 0.25, y - size * 0.25],
            [x + size, y],
            [x + size * 0.25, y + size * 0.25],
            [x, y + size],
            [x - size * 0.25, y + size * 0.25],
            [x - size, y],
            [x - size * 0.25, y - size * 0.25],
        ],
        color,
    );
}

function background(accent = gold) {
    ctx.clearRect(0, 0, 640, 400);
    const gradient = ctx.createLinearGradient(0, 0, 640, 400);
    gradient.addColorStop(0, '#121c30');
    gradient.addColorStop(1, '#263345');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 400);
    const glow = ctx.createRadialGradient(460, 210, 8, 460, 210, 220);
    glow.addColorStop(0, `${accent}24`);
    glow.addColorStop(1, `${accent}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 640, 400);
    ctx.strokeStyle = '#d9b66b35';
    ctx.lineWidth = 1;
    ctx.strokeRect(16.5, 16.5, 607, 367);
    // 青海波を思わせる重なりで、静止した背景にも和の雰囲気を添える。
    ctx.strokeStyle = '#f4deb40c';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 10; col++) {
            for (const radius of [14, 22, 30]) {
                ctx.beginPath();
                ctx.arc(col * 76 + (row % 2) * 38, 400 - row * 28, radius, Math.PI, 0);
                ctx.stroke();
            }
        }
    }
    ctx.fillStyle = '#d75e4e';
    ctx.fillRect(39, 36, 27, 27);
    // イカのシルエットは外部素材を使わず図形で描く。
    polygon(
        [
            [52, 40],
            [42, 52],
            [46, 53],
            [45, 59],
            [50, 56],
            [52, 60],
            [54, 56],
            [59, 59],
            [58, 53],
            [62, 52],
        ],
        paper,
    );
    text('IKABU  /  OMIKUJI', 78, 55, 14, '#e5d2b0');
    text('イカ部のおみくじ', 40, 358, 12, '#b3b9c5');
    text('ひと振りに、願いを。', 454, 358, 12, '#b3b9c5');
    for (const [x, y, s] of [
        [369, 97, 4],
        [577, 127, 6],
        [592, 283, 3],
        [347, 296, 5],
    ]) {
        star(x, y, s, `${accent}88`);
    }
}

function tube(angle: number, lift: number) {
    ctx.save();
    ctx.translate(460, 236);
    ctx.rotate(angle);
    // くじ棒を筒の奥に描き、飛び出すときだけ上へ動かす。
    ctx.fillStyle = '#f1d49b';
    ctx.fillRect(-7, -65 - lift, 14, 110);
    ctx.fillStyle = '#cf6750';
    ctx.fillRect(-7, -65 - lift, 14, 16);
    polygon(
        [
            [-61, -51],
            [0, -36],
            [0, 85],
            [-61, 66],
        ],
        '#bf543c',
    );
    polygon(
        [
            [0, -36],
            [61, -51],
            [61, 66],
            [0, 85],
        ],
        '#8d362e',
    );
    polygon(
        [
            [-61, -51],
            [0, -70],
            [61, -51],
            [0, -33],
        ],
        '#ec9d64',
    );
    polygon(
        [
            [-48, -51],
            [0, -64],
            [48, -51],
            [0, -39],
        ],
        '#6b362c',
    );
    // 棒が口の縁で隠れないよう、筒より上の部分を重ねる。
    if (lift > 0) {
        ctx.fillStyle = '#f1d49b';
        ctx.fillRect(-7, -65 - lift, 14, lift + 14);
        ctx.fillStyle = '#cf6750';
        ctx.fillRect(-7, -65 - lift, 14, 16);
    }
    polygon(
        [
            [-61, -36],
            [0, -18],
            [61, -36],
            [61, -27],
            [0, -9],
            [-61, -27],
        ],
        gold,
    );
    polygon(
        [
            [-61, 49],
            [0, 68],
            [61, 49],
            [61, 59],
            [0, 78],
            [-61, 59],
        ],
        gold,
    );
    ctx.save();
    ctx.transform(1, 0.29, 0, 1, -44, -20);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, 31, 65);
    text('御', 6, 22, 20, '#963d30', true);
    text('籤', 6, 49, 20, '#963d30', true);
    ctx.restore();
    ctx.strokeStyle = '#fbd49238';
    for (const x of [14, 29, 44]) {
        ctx.beginPath();
        ctx.moveTo(x, -4 - x * 0.29);
        ctx.lineTo(x, 60 - x * 0.29);
        ctx.stroke();
    }
    ctx.restore();
}

function animationFrame(frame: number) {
    const t = frame / fps;
    background();
    text('運だめし、', 42, 139, 35, paper, true);
    text('ひと振り。', 42, 186, 35, paper, true);
    text(t < 1.9 ? 'からから、ころころ。' : 'さあ、運勢は……？', 44, 236, 17, '#dfc899');
    text('願いをこめて振るでし！', 44, 266, 14, '#b3b9c5');
    ctx.fillStyle = '#070f204d';
    ctx.beginPath();
    ctx.ellipse(460, 327, 83, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    const shaking = t < 1.9;
    const angle = shaking ? Math.sin(t * Math.PI * 8) * 0.22 * Math.min(t * 5, 1) : 0;
    const lift = shaking ? 0 : 78 * (1 - Math.pow(1 - Math.min((t - 1.9) / 0.45, 1), 3));
    tube(angle, lift);
    if (shaking) {
        ctx.strokeStyle = `${gold}88`;
        ctx.lineWidth = 2;
        for (const side of [-1, 1]) {
            const x = 460 + side * (86 + Math.sin(t * 20) * 3);
            ctx.beginPath();
            ctx.moveTo(x, 192);
            ctx.quadraticCurveTo(x + side * 12, 223, x, 251);
            ctx.stroke();
        }
    } else {
        const burst = Math.min((t - 1.9) / 0.7, 1);
        for (let n = 0; n < 12; n++) {
            const a = (n * Math.PI * 2) / 12;
            const r = 42 + burst * 62;
            star(
                460 + Math.cos(a) * r,
                139 + Math.sin(a) * r * 0.65,
                3 + Math.sin(burst * Math.PI) * 3,
                n % 2 ? gold : '#ed9478',
            );
        }
    }
    for (let n = 0; n < 3; n++) {
        ctx.fillStyle = Math.floor(t * 3) % 3 === n ? gold : '#667080';
        ctx.beginPath();
        ctx.arc(48 + n * 15, 300, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resultImage(fortune: (typeof fortunes)[number]) {
    const accent = `#${fortune.color.toString(16).padStart(6, '0')}`;
    background(accent);
    text('今回の運勢', 44, 111, 17, '#dfc899');
    text(fortune.name, 38, 211, 88, accent, true);
    text('でし！', 45, 245, 18, '#e5d2b0');
    const characters = Array.from(fortune.message);
    ctx.font = 'normal 16px Omikuji';
    // 文の切れ目を優先し、末尾の「！」だけが次の行に残ることを避ける。
    const breaks = characters
        .map((character, index) => ({
            index: index + 1,
            punctuation: /[。！？、]/u.test(character),
        }))
        .filter(({ index }) => index < characters.length && !/[。！？、]/u.test(characters[index]))
        .filter(({ index }) =>
            [characters.slice(0, index), characters.slice(index)].every(
                (line) => ctx.measureText(line.join('')).width <= 310,
            ),
        )
        .sort(
            (a, b) =>
                Number(b.punctuation) - Number(a.punctuation) ||
                Math.abs(a.index - characters.length / 2) -
                    Math.abs(b.index - characters.length / 2),
        );
    const split = breaks[0]?.index;
    if (split === undefined)
        throw new Error(`結果画像のメッセージが2行に収まりません: ${fortune.id}`);
    text(characters.slice(0, split).join(''), 44, 284, 16);
    text(characters.slice(split).join(''), 44, 309, 16);
    ctx.save();
    ctx.translate(465, 202);
    ctx.rotate(0.045);
    ctx.shadowColor = '#00000055';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = paper;
    ctx.fillRect(-60, -116, 120, 245);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#c85543';
    ctx.lineWidth = 2;
    ctx.strokeRect(-52, -108, 104, 229);
    text('御 神 籤', -34, -79, 14, '#b34c3c', true);
    ctx.fillStyle = '#c8554355';
    ctx.fillRect(-38, -65, 76, 1);
    const symbols = Array.from(fortune.name);
    symbols.forEach((symbol, i) =>
        text(symbol, -25, symbols.length === 1 ? 10 : -8 + i * 55, 50, '#a13e32', true),
    );
    ctx.strokeStyle = '#c85543';
    ctx.strokeRect(-16, 76, 32, 32);
    text('福', -12, 101, 24, '#b34c3c', true);
    ctx.restore();
    for (let n = 0; n < 15; n++) {
        const a = (n * Math.PI * 2) / 15;
        const x = 465 + Math.cos(a) * (94 + (n % 3) * 12);
        const y = 205 + Math.sin(a) * 130;
        if (n % 3 === 0) star(x, y, 6, accent);
        else {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(a);
            ctx.fillStyle = n % 2 ? accent : '#d76d5b';
            ctx.fillRect(-2, -4, 4, 8);
            ctx.restore();
        }
    }
}

if (!ffmpeg) throw new Error('FFmpeg が見つかりません。pnpm install を実行してください。');
mkdirSync(output, { recursive: true });
const frames = mkdtempSync(path.join(tmpdir(), 'omikuji-'));
try {
    for (let frame = 0; frame < (omikujiAnimationDuration / 1000) * fps; frame++) {
        animationFrame(frame);
        writeFileSync(
            path.join(frames, `${String(frame).padStart(3, '0')}.png`),
            canvas.toBuffer('image/png'),
        );
    }
    execFileSync(
        ffmpeg,
        [
            '-y',
            '-loglevel',
            'error',
            '-framerate',
            String(fps),
            '-i',
            path.join(frames, '%03d.png'),
            '-filter_complex',
            '[0:v]split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=none',
            '-loop',
            '-1',
            path.join(output, 'drawing.gif'),
        ],
        { stdio: 'inherit' },
    );
    for (const fortune of fortunes) {
        resultImage(fortune);
        writeFileSync(path.join(output, `${fortune.id}.png`), canvas.toBuffer('image/png'));
    }
    console.log(`おみくじの GIF と結果画像7枚を生成しました: ${output}`);
} finally {
    rmSync(frames, { recursive: true, force: true });
}
