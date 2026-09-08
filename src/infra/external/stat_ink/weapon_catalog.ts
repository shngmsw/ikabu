import { prisma } from '@/infra/db/prisma';
import { log4js_obj } from '@/infra/logging/log4js';

import { Weapon } from './weapon';

const ttl = 24 * 60 * 60 * 1000;
const retryDelay = 60 * 1000;
const logger = log4js_obj.getLogger('weapon_catalog');

function parseWeapons(data: unknown): Weapon[] {
    if (!Array.isArray(data) || !data.length) throw new Error('Empty weapon catalog');
    const keys = new Set<string>();
    for (const weapon of data) {
        if (
            typeof weapon?.key !== 'string' ||
            !weapon.key.length ||
            weapon.key.length > 40 ||
            keys.has(weapon.key) ||
            typeof weapon?.name?.ja_JP !== 'string' ||
            !weapon.name.ja_JP.length ||
            weapon.name.ja_JP.length > 100 ||
            typeof weapon?.name?.en_US !== 'string' ||
            typeof weapon?.type?.key !== 'string' ||
            typeof weapon?.sub?.name?.ja_JP !== 'string' ||
            typeof weapon?.special?.name?.ja_JP !== 'string'
        )
            throw new Error('Invalid weapon catalog');
        keys.add(weapon.key);
    }
    return data;
}

export class WeaponCatalog {
    private weapons: Weapon[] = [];
    private fetchedAt = 0;
    private retryAt = 0;
    private loading?: Promise<void>;
    private refreshing?: Promise<void>;

    private load() {
        this.loading ??= (async () => {
            const stored = await prisma.weaponCatalog.findUnique({ where: { id: 1 } });
            if (stored) {
                this.weapons = parseWeapons(JSON.parse(stored.payload));
                this.fetchedAt = stored.fetchedAt.getTime();
            }
        })().catch((error) => {
            logger.warn('ブキ一覧のDBキャッシュを読み込めませんでした', error);
        });
        return this.loading;
    }

    private refresh() {
        if (this.refreshing) return this.refreshing;
        if (Date.now() < this.fetchedAt + ttl || Date.now() < this.retryAt)
            return Promise.resolve();
        this.refreshing = (async () => {
            try {
                const response = await fetch('https://stat.ink/api/v3/weapon', {
                    signal: AbortSignal.timeout(5000),
                });
                if (!response.ok) throw new Error(`Weapon API HTTP ${response.status}`);
                const weapons = parseWeapons(await response.json());
                const fetchedAt = new Date();
                const data = { payload: JSON.stringify(weapons), fetchedAt };
                await prisma.weaponCatalog.upsert({
                    where: { id: 1 },
                    create: { id: 1, ...data },
                    update: data,
                });
                this.weapons = weapons;
                this.fetchedAt = fetchedAt.getTime();
            } catch (error) {
                this.retryAt = Date.now() + retryDelay;
                logger.warn('ブキ一覧の更新に失敗しました。保存済みの一覧を使用します', error);
            } finally {
                this.refreshing = undefined;
            }
        })();
        return this.refreshing;
    }

    async get(): Promise<Weapon[]> {
        await this.load();
        await this.refresh();
        return this.weapons;
    }

    // autocomplete は defer できないため、API更新を待たず読み込み済みの一覧を返す。
    getCached(): Weapon[] {
        void this.load().then(() => this.refresh());
        return this.weapons;
    }
}

export const weaponCatalog = new WeaponCatalog();
