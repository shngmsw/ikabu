import path from 'node:path';

import Canvas from 'canvas';
import { intervalToDuration } from 'date-fns';

export interface ProfileBadge {
    name: string;
    iconUrl: string | null;
    emoji: string | null;
    color: string;
}

export interface ProfileCardData {
    displayName: string;
    avatarUrl: string | null;
    joinedAt: Date | null;
    friendCode: string | null;
    messageCount: number;
    favoriteWeapon: string | null;
    isSupporter: boolean;
    badges: ProfileBadge[];
}

const WIDTH = 1000;
const HEIGHT = 680;
const INK = '#141725';
const MUTED = '#abb4c9';
let fontsRegistered = false;

function registerFonts() {
    if (fontsRegistered) return;
    Canvas.registerFont(path.resolve('fonts/GenShinGothic-P-Bold.ttf'), { family: 'Profile Bold' });
    Canvas.registerFont(path.resolve('fonts/GenShinGothic-P-Medium.ttf'), { family: 'Profile' });
    Canvas.registerFont(path.resolve('fonts/SEGUISYM.TTF'), { family: 'Profile Symbols' });
    fontsRegistered = true;
}

export function formatTenure(joinedAt: Date | null, now: Date): string {
    if (!joinedAt || !Number.isFinite(joinedAt.getTime()) || joinedAt > now) return '未登録';
    const { years = 0, months = 0, days = 0 } = intervalToDuration({ start: joinedAt, end: now });
    return (
        [years ? `${years}年` : '', months ? `${months}ヶ月` : '', days ? `${days}日` : '']
            .filter(Boolean)
            .join(' ') || '0日'
    );
}

function font(ctx: Canvas.CanvasRenderingContext2D, size: number, bold = true) {
    ctx.font = `${size}px "${bold ? 'Profile Bold' : 'Profile'}", "Profile Symbols"`;
}

export function fitText(
    ctx: Canvas.CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
): string {
    const chars = Array.from(text.replace(/\s+/gu, ' '));
    if (ctx.measureText(chars.join('')).width <= maxWidth) return chars.join('');
    while (chars.length && ctx.measureText(`${chars.join('')}…`).width > maxWidth) chars.pop();
    return `${chars.join('')}…`;
}

function text(
    ctx: Canvas.CanvasRenderingContext2D,
    value: string,
    x: number,
    y: number,
    size: number,
    color: string,
    width: number,
    bold = true,
) {
    font(ctx, size, bold);
    ctx.fillStyle = color;
    ctx.fillText(fitText(ctx, value, width), x, y);
}

function roundRect(
    ctx: Canvas.CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string,
) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
}

async function loadOptionalImage(url: string | null): Promise<Canvas.Image | null> {
    if (!url) return null;
    try {
        // Discord CDNの遅延でプロフィール全体が待たされないようにする。
        const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!response.ok) return null;
        return await Canvas.loadImage(Buffer.from(await response.arrayBuffer()));
    } catch {
        return null;
    }
}

export async function renderProfileCard(data: ProfileCardData, now = new Date()): Promise<Buffer> {
    registerFonts();
    const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    const accent = data.isSupporter ? '#f6ce76' : '#d5f85a';
    // 2行、各3枚の範囲に収め、描画しないロールの画像は取得しない。
    const visibleBadges = data.badges.slice(0, 6);
    const [avatar, ...icons] = await Promise.all([
        loadOptionalImage(data.avatarUrl),
        ...visibleBadges.map((badge) => loadOptionalImage(badge.iconUrl)),
    ]);

    roundRect(ctx, 0, 0, WIDTH, HEIGHT, 28, INK);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, WIDTH, HEIGHT, 28);
    ctx.clip();
    const glow = ctx.createLinearGradient(450, 0, 1000, 360);
    glow.addColorStop(0, '#282346');
    glow.addColorStop(1, '#544077');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.moveTo(560, 0);
    ctx.lineTo(1000, 0);
    ctx.lineTo(1000, 300);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = accent;
    for (const [x, y, r] of [
        [895, 68, 94],
        [975, 178, 38],
        [772, 18, 17],
    ]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#e0ccff';
    ctx.lineWidth = 1;
    for (let x = 600; x < 1150; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 200, 230);
        ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(3, 3, WIDTH - 6, HEIGHT - 6, 26);
    ctx.strokeStyle = data.isSupporter ? accent : '#34384c';
    ctx.lineWidth = data.isSupporter ? 6 : 2;
    ctx.stroke();

    text(ctx, 'IKABU / MEMBER PROFILE', 38, 46, 16, accent, 590);
    if (data.isSupporter) {
        roundRect(ctx, 775, 25, 187, 32, 16, accent);
        text(ctx, '★ SUPPORTER', 795, 48, 16, INK, 150);
    } else {
        text(ctx, 'イカ部プロフィール', 762, 47, 16, '#ded6f2', 200);
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(114, 144, 68, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#353c53';
    ctx.fillRect(46, 76, 136, 136);
    if (avatar) ctx.drawImage(avatar, 46, 76, 136, 136);
    else text(ctx, 'イカ', 77, 160, 34, accent, 85);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(114, 144, 72, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.stroke();
    text(ctx, 'PLAYER', 214, 107, 14, MUTED, 710);
    text(ctx, data.displayName, 212, 158, 40, '#ffffff', 730);
    const joinedAt = data.joinedAt;
    const joined =
        joinedAt && Number.isFinite(joinedAt.getTime()) && joinedAt <= now
            ? new Intl.DateTimeFormat('ja-JP', {
                  timeZone: 'Asia/Tokyo',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
              }).format(joinedAt)
            : '未登録';
    text(ctx, `入部日  ${joined}`, 215, 194, 18, '#c8cde0', 720, false);

    roundRect(ctx, 38, 244, 452, 122, 16, '#23283a');
    roundRect(ctx, 510, 244, 452, 122, 16, '#23283a');
    text(ctx, 'イカ部歴', 60, 278, 18, MUTED, 407);
    text(ctx, formatTenure(data.joinedAt, now), 59, 336, 37, accent, 405);
    text(ctx, 'チャット数', 534, 278, 18, MUTED, 180);
    text(ctx, '全サーバー合計', 794, 278, 14, MUTED, 147, false);
    text(ctx, Math.max(0, data.messageCount).toLocaleString('ja-JP'), 532, 336, 40, '#ffffff', 370);
    text(ctx, '件', 919, 335, 18, MUTED, 25);

    text(ctx, 'フレンドコード', 40, 409, 16, MUTED, 445);
    text(ctx, data.friendCode || '未登録', 39, 446, 26, data.friendCode ? '#ffffff' : MUTED, 440);
    text(ctx, '好きなブキ', 513, 409, 16, MUTED, 445);
    text(
        ctx,
        data.favoriteWeapon || '未登録',
        512,
        446,
        26,
        data.favoriteWeapon ? '#ffffff' : MUTED,
        447,
    );

    ctx.fillStyle = '#34394d';
    ctx.fillRect(38, 470, 924, 1);
    text(ctx, 'ロールバッジ', 40, 503, 16, MUTED, 500);
    const hiddenCount = data.badges.length - visibleBadges.length;
    if (hiddenCount > 0) text(ctx, `ほか ${hiddenCount} ロール`, 783, 503, 14, MUTED, 178, false);
    if (!visibleBadges.length) text(ctx, 'まだバッジはありません', 40, 549, 18, MUTED, 890, false);
    for (const [i, badge] of visibleBadges.entries()) {
        const x = 38 + (i % 3) * 314;
        const y = 519 + Math.floor(i / 3) * 48;
        roundRect(ctx, x, y, 296, 38, 19, '#2b3044');
        const icon = icons[i];
        if (icon) ctx.drawImage(icon, x + 10, y + 7, 24, 24);
        else if (badge.emoji) text(ctx, badge.emoji, x + 10, y + 27, 21, '#ffffff', 25);
        else {
            ctx.fillStyle = badge.color === '#000000' ? accent : badge.color;
            ctx.beginPath();
            ctx.arc(x + 22, y + 19, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        text(ctx, badge.name, x + 43, y + 26, 16, '#e6eaf5', 238);
    }
    text(ctx, '/プロフィール設定 で好きなブキを登録', 40, 648, 14, MUTED, 580, false);
    text(ctx, 'INK YOUR STORY.', 746, 648, 16, accent, 218);
    return canvas.toBuffer('image/png');
}
