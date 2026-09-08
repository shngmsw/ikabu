import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ findUnique: vi.fn(), upsert: vi.fn() }));
vi.mock('@/infra/db/prisma', () => ({ prisma: { weaponCatalog: db } }));
vi.mock('@/infra/logging/log4js', () => ({ log4js_obj: { getLogger: () => ({ warn: vi.fn() }) } }));
import { WeaponCatalog } from '@/infra/external/stat_ink/weapon_catalog';

import { weapon } from '../../../fixtures/weapons';

const fetchMock = vi.fn();
const now = new Date('2026-09-09T00:00:00Z');
const stored = (age = 0) => ({
    payload: JSON.stringify([weapon()]),
    fetchedAt: new Date(+now - age),
});
const response = (items = [weapon()]) => ({ ok: true, json: async () => items });
beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.stubGlobal('fetch', fetchMock);
    db.findUnique.mockResolvedValue(null);
    db.upsert.mockResolvedValue({});
    fetchMock.mockResolvedValue(response());
});
afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('ブキ一覧DBキャッシュ', () => {
    it('初回に取得・保存し、再起動後はDBから復元する', async () => {
        expect(await new WeaponCatalog().get()).toEqual([weapon()]);
        expect(db.upsert).toHaveBeenCalledOnce();
        db.findUnique.mockResolvedValue(stored());
        expect(await new WeaponCatalog().get()).toEqual([weapon()]);
        expect(fetchMock).toHaveBeenCalledOnce();
    });
    it('24時間後にAPIの新ブキを取り込む', async () => {
        db.findUnique.mockResolvedValue(stored(24 * 3600000));
        fetchMock.mockResolvedValue(response([weapon('new', '新ブキ')]));
        expect(await new WeaponCatalog().get()).toEqual([weapon('new', '新ブキ')]);
    });
    it('更新中もautocompleteには古い一覧をすぐ返す', async () => {
        db.findUnique.mockResolvedValue(stored());
        const catalog = new WeaponCatalog();
        await catalog.get();
        vi.setSystemTime(+now + 24 * 3600000);
        fetchMock.mockReturnValue(new Promise(() => undefined));
        expect(catalog.getCached()).toEqual([weapon()]);
        await Promise.resolve();
        expect(fetchMock).toHaveBeenCalledOnce();
    });
    it('同時取得をまとめる', async () => {
        const catalog = new WeaponCatalog();
        await Promise.all([catalog.get(), catalog.get(), catalog.get()]);
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(db.findUnique).toHaveBeenCalledOnce();
    });
    it.each(['http', 'empty', 'invalid', 'network'])(
        '%sの失敗では保存済み一覧を維持する',
        async (kind) => {
            db.findUnique.mockResolvedValue(stored(24 * 3600000));
            if (kind === 'network') fetchMock.mockRejectedValue(new Error('network'));
            else
                fetchMock.mockResolvedValue(
                    kind === 'http'
                        ? { ok: false, status: 503 }
                        : response(kind === 'empty' ? [] : [{} as never]),
                );
            const catalog = new WeaponCatalog();
            expect(await catalog.get()).toEqual([weapon()]);
            expect(db.upsert).not.toHaveBeenCalled();
            await catalog.get();
            expect(fetchMock).toHaveBeenCalledOnce();
            vi.setSystemTime(+now + 60000);
            fetchMock.mockResolvedValue(response([weapon('new', '新ブキ')]));
            expect(await catalog.get()).toEqual([weapon('new', '新ブキ')]);
        },
    );
    it('初回失敗時は空候補を返し、次の利用時に再試行できる', async () => {
        fetchMock.mockRejectedValue(new Error('offline'));
        const catalog = new WeaponCatalog();
        expect(await catalog.get()).toEqual([]);
        expect(catalog.getCached()).toEqual([]);
        vi.setSystemTime(+now + 60000);
        fetchMock.mockResolvedValue(response());
        expect(await catalog.get()).toEqual([weapon()]);
    });
});
