import { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/error';

const prisma = new PrismaClient();

class SkinService {
    /**
     * Get all owned skins for a user
     */
    async getUserSkins(userId: string) {
        const skins = await prisma.userSkin.findMany({
            where: { userId },
            orderBy: { purchasedAt: 'desc' },
        });

        return skins;
    }

    /**
     * Purchase a skin
     */
    async purchaseSkin(userId: string, skinId: string, tokenCost: number) {
        // Check if user already owns the skin
        const existingSkin = await prisma.userSkin.findUnique({
            where: {
                userId_skinId: {
                    userId,
                    skinId,
                },
            },
        });

        if (existingSkin) {
            throw new HttpError(400, 'Skin already owned');
        }

        // Check if user has enough tokens
        const progress = await prisma.userProgress.findUnique({
            where: { userId },
        });

        if (!progress || progress.totalTokens < tokenCost) {
            throw new HttpError(400, 'Insufficient tokens');
        }

        // Create transaction to purchase skin and deduct tokens
        const result = await prisma.$transaction(async (tx) => {
            // Deduct tokens
            const updatedProgress = await tx.userProgress.update({
                where: { userId },
                data: {
                    totalTokens: progress.totalTokens - tokenCost,
                },
            });

            // Add skin to user's collection
            const purchasedSkin = await tx.userSkin.create({
                data: {
                    userId,
                    skinId,
                    purchasedWithTokens: tokenCost,
                },
            });

            return { skin: purchasedSkin, progress: updatedProgress };
        });

        return result;
    }

    /**
     * Equip a skin
     */
    async equipSkin(userId: string, skinId: string) {
        // Check if user owns the skin
        const ownedSkin = await prisma.userSkin.findUnique({
            where: {
                userId_skinId: {
                    userId,
                    skinId,
                },
            },
        });

        if (!ownedSkin && skinId !== 'default') {
            throw new HttpError(404, 'Skin not owned');
        }

        // Update equipped skin
        const progress = await prisma.userProgress.update({
            where: { userId },
            data: {
                equippedSkin: skinId,
            },
        });

        return progress;
    }

    /**
     * Get available skins catalog
     */
    async getAvailableSkins() {
        // This would typically come from a Skins table
        // For now, return a hardcoded list matching Unity's skins
        return [
            {
                id: 'default',
                name: 'Default',
                description: 'The classic CodeBound programmer',
                tokenCost: 0,
                isDefault: true,
            },
            {
                id: 'cyber',
                name: 'Cyber Hacker',
                description: 'Futuristic cyberpunk hacker with neon glow',
                tokenCost: 500,
                isDefault: false,
            },
            {
                id: 'ninja',
                name: 'Code Ninja',
                description: 'Stealthy ninja warrior with shadow effects',
                tokenCost: 750,
                isDefault: false,
            },
            {
                id: 'robot',
                name: 'Binary Bot',
                description: 'Mechanical robot with glowing core',
                tokenCost: 800,
                isDefault: false,
            },
            {
                id: 'wizard',
                name: 'Algorithm Wizard',
                description: 'Mystical sorcerer with magical powers',
                tokenCost: 1000,
                isDefault: false,
            },
            {
                id: 'knight',
                name: 'Code Knight',
                description: 'Medieval warrior in shining armor',
                tokenCost: 1200,
                isDefault: false,
            },
            {
                id: 'pirate',
                name: 'Debug Pirate',
                description: 'Swashbuckling pirate captain',
                tokenCost: 900,
                isDefault: false,
            },
            {
                id: 'space',
                name: 'Space Explorer',
                description: 'Astronaut exploring the code galaxy',
                tokenCost: 1500,
                isDefault: false,
            },
        ];
    }

    /**
     * Check if user owns a specific skin
     */
    async checkSkinOwnership(userId: string, skinId: string) {
        if (skinId === 'default') {
            return true; // Everyone owns default
        }

        const skin = await prisma.userSkin.findUnique({
            where: {
                userId_skinId: {
                    userId,
                    skinId,
                },
            },
        });

        return !!skin;
    }
}

export default new SkinService();
