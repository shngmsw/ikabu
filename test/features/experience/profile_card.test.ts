import Canvas from 'canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fitText, formatTenure, renderProfileCard } from '@/features/experience/profile_card';

const now = new Date('2026-09-09T00:00:00Z');
afterEach(() => vi.unstubAllGlobals());

describe('在籍期間', () => {
    it.each([
        [null, '未登録'],
        [new Date('invalid'), '未登録'],
        [new Date('2027-01-01'), '未登録'],
        [now, '0日'],
        [new Date('2023-06-01T00:00:00Z'), '3年 3ヶ月 8日'],
        [new Date('2026-08-09T00:00:00Z'), '1ヶ月'],
    ])('%s → %s', (joined, expected) => expect(formatTenure(joined, now)).toBe(expected));
});

it('長い文字列を横幅以内で省略する', () => {
    const ctx = Canvas.createCanvas(100, 100).getContext('2d');
    ctx.font = '24px sans-serif';
    const fitted = fitText(ctx, 'あ'.repeat(100), 200);
    expect(fitted.endsWith('…')).toBe(true);
    expect(ctx.measureText(fitted).width).toBeLessThanOrEqual(200);
});

it('画像取得が失敗してもPNGを生成し、ロール画像の取得を6件に制限する', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const buffer = await renderProfileCard(
        {
            displayName: '名前'.repeat(30),
            avatarUrl: 'https://example.com/avatar',
            joinedAt: null,
            friendCode: null,
            messageCount: 0,
            favoriteWeapon: null,
            isSupporter: true,
            badges: Array.from({ length: 20 }, () => ({
                name: 'ロール'.repeat(20),
                iconUrl: 'https://example.com/role',
                emoji: null,
                color: '#000000',
            })),
        },
        now,
    );
    const image = await Canvas.loadImage(buffer);
    expect([image.width, image.height]).toEqual([1000, 680]);
    expect(fetchMock).toHaveBeenCalledTimes(7);
});
