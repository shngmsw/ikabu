import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const dbPath =
    process.env.DATABASE_URL ??
    `file:${path.join(process.cwd(), 'ikabu.sqlite3')}`;

const adapter = new PrismaBetterSqlite3({
    url: dbPath,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
