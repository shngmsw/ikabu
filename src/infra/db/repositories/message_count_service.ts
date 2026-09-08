import { prisma } from '@/infra/db/prisma';

export class MessageCountService {
    static async increment(userId: string) {
        // 同時投稿でも加算を失わないよう、読み取りと更新を1つのSQLにまとめる。
        await prisma.$executeRaw`
            INSERT INTO message_count (user_id, count) VALUES (${userId}, 1)
            ON CONFLICT(user_id) DO UPDATE SET count = count + 1
        `;
    }

    static async save(userId: string, count: number) {
        await prisma.messageCount.upsert({
            where: {
                userId: userId,
            },
            update: {
                count: count,
            },
            create: {
                userId: userId,
                count: count,
            },
        });
    }

    static async getMemberByUserId(userId: string) {
        const member = await prisma.messageCount.findUnique({
            where: {
                userId: userId,
            },
        });
        return member;
    }
}
