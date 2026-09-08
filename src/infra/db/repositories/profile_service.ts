import { prisma } from '@/infra/db/prisma';

export class ProfileService {
    static get(userId: string) {
        return prisma.profile.findUnique({ where: { userId } });
    }

    static setWeapon(userId: string, favoriteWeapon: string) {
        return prisma.profile.upsert({
            where: { userId },
            create: { userId, favoriteWeapon },
            update: { favoriteWeapon },
        });
    }

    static clearWeapon(userId: string) {
        return prisma.profile.deleteMany({ where: { userId } });
    }
}
