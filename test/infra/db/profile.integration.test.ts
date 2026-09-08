import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import Database from 'better-sqlite3';
import { afterAll, beforeAll, expect, it } from 'vitest';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ikabu-profile-test-'));
const dbPath = path.join(dir, 'test.sqlite3');
process.env.DATABASE_URL = `file:${dbPath}`;
let ProfileService: typeof import('@/infra/db/repositories/profile_service').ProfileService;
let MessageCountService: typeof import('@/infra/db/repositories/message_count_service').MessageCountService;
let prisma: typeof import('@/infra/db/prisma').prisma;

beforeAll(async () => {
    const db = new Database(dbPath);
    db.exec('CREATE TABLE message_count (user_id TEXT NOT NULL UNIQUE, count INTEGER NOT NULL)');
    db.prepare('INSERT INTO message_count (user_id, count) VALUES (?, ?)').run('existing', 100);
    db.exec(fs.readFileSync('prisma/migrations/20260909000000_add_profile/migration.sql', 'utf8'));
    db.close();
    ({ ProfileService } = await import('@/infra/db/repositories/profile_service'));
    ({ MessageCountService } = await import('@/infra/db/repositories/message_count_service'));
    ({ prisma } = await import('@/infra/db/prisma'));
});
afterAll(async () => {
    await prisma?.$disconnect();
    fs.rmSync(dir, { recursive: true, force: true });
});

it('追加マイグレーション後にブキを保存、更新、解除でき、他人の情報を変更しない', async () => {
    expect(await ProfileService.get('self')).toBeNull();
    await ProfileService.setWeapon('self', 'わかばシューター');
    await ProfileService.setWeapon('other', 'スプラローラー');
    await ProfileService.setWeapon('self', 'スプラシューター');
    expect((await ProfileService.get('self'))?.favoriteWeapon).toBe('スプラシューター');
    await ProfileService.clearWeapon('self');
    await ProfileService.clearWeapon('self');
    expect(await ProfileService.get('self')).toBeNull();
    expect((await ProfileService.get('other'))?.favoriteWeapon).toBe('スプラローラー');
});

it('初回投稿を1件とし、同時加算を失わない', async () => {
    await MessageCountService.increment('new');
    expect((await MessageCountService.getMemberByUserId('new'))?.count).toBe(1);
    await Promise.all(Array.from({ length: 20 }, () => MessageCountService.increment('new')));
    expect((await MessageCountService.getMemberByUserId('new'))?.count).toBe(21);
    await Promise.all(Array.from({ length: 20 }, () => MessageCountService.increment('existing')));
    expect((await MessageCountService.getMemberByUserId('existing'))?.count).toBe(120);
});
