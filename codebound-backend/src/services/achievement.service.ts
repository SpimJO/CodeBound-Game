import { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/error';

const prisma = new PrismaClient();

interface AchievementData {
    levelCompleted?: number;
    tokensEarned?: number;
    timeSpent?: number;
    hintsUsed?: number;
    isPerfect?: boolean;
}

// Achievement definitions
const ACHIEVEMENTS = {
    FIRST_LEVEL: 'first_level',
    LEVEL_10: 'level_10',
    LEVEL_25: 'level_25',
    LEVEL_50: 'level_50',
    LEVEL_100: 'level_100',
    SPEED_DEMON: 'speed_demon', // Complete level in under 30 seconds
    PERFECTIONIST: 'perfectionist', // Complete 10 levels without hints
    TOKEN_COLLECTOR: 'token_collector', // Earn 1000 tokens
    TOKEN_MASTER: 'token_master', // Earn 5000 tokens
    NO_HINTS: 'no_hints', // Complete 5 levels without hints in a row
    MARATHON: 'marathon', // Play for 1 hour total
    DEDICATED: 'dedicated', // Play for 10 hours total
};

class AchievementService {
    /**
     * Check and unlock achievements based on player actions
     */
    async checkAndUnlockAchievements(userId: string, data: AchievementData) {
        const achievementsToUnlock: string[] = [];

        // Level-based achievements
        if (data.levelCompleted) {
            if (data.levelCompleted === 1) achievementsToUnlock.push(ACHIEVEMENTS.FIRST_LEVEL);
            if (data.levelCompleted === 10) achievementsToUnlock.push(ACHIEVEMENTS.LEVEL_10);
            if (data.levelCompleted === 25) achievementsToUnlock.push(ACHIEVEMENTS.LEVEL_25);
            if (data.levelCompleted === 50) achievementsToUnlock.push(ACHIEVEMENTS.LEVEL_50);
            if (data.levelCompleted === 100) achievementsToUnlock.push(ACHIEVEMENTS.LEVEL_100);
        }

        // Speed demon - complete in under 30 seconds
        if (data.timeSpent && data.timeSpent < 30) {
            achievementsToUnlock.push(ACHIEVEMENTS.SPEED_DEMON);
        }

        // Check token-based achievements
        const progress = await prisma.userProgress.findUnique({
            where: { userId },
        });

        if (progress) {
            if (progress.totalTokens >= 1000) {
                achievementsToUnlock.push(ACHIEVEMENTS.TOKEN_COLLECTOR);
            }
            if (progress.totalTokens >= 5000) {
                achievementsToUnlock.push(ACHIEVEMENTS.TOKEN_MASTER);
            }

            // Marathon achievements (1 hour = 3600 seconds)
            if (progress.totalPlayTime >= 3600) {
                achievementsToUnlock.push(ACHIEVEMENTS.MARATHON);
            }
            if (progress.totalPlayTime >= 36000) {
                achievementsToUnlock.push(ACHIEVEMENTS.DEDICATED);
            }
        }

        // Check perfect levels (no hints)
        if (data.hintsUsed === 0) {
            const perfectLevels = await prisma.levelCompletion.count({
                where: {
                    userId,
                    hintsUsed: 0,
                },
            });

            if (perfectLevels >= 10) {
                achievementsToUnlock.push(ACHIEVEMENTS.PERFECTIONIST);
            }
        }

        // Unlock achievements that haven't been unlocked yet
        const unlockedAchievements = [];
        for (const achievementId of achievementsToUnlock) {
            try {
                const achievement = await prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId,
                        progress: 100,
                    },
                });
                unlockedAchievements.push(achievement);
            } catch (error) {
                // Achievement already exists, skip
                continue;
            }
        }

        return unlockedAchievements;
    }

    /**
     * Get user achievements
     */
    async getUserAchievements(userId: string) {
        const achievements = await prisma.userAchievement.findMany({
            where: { userId },
            orderBy: { unlockedAt: 'desc' },
        });

        return achievements;
    }

    /**
     * Get achievement progress
     */
    async getAchievementProgress(userId: string) {
        const achievements = await this.getUserAchievements(userId);
        const progress = await prisma.userProgress.findUnique({
            where: { userId },
        });

        const perfectLevels = await prisma.levelCompletion.count({
            where: {
                userId,
                hintsUsed: 0,
            },
        });

        const allAchievements = Object.values(ACHIEVEMENTS);
        const unlockedIds = achievements.map((a) => a.achievementId);

        return {
            unlocked: achievements,
            total: allAchievements.length,
            unlockedCount: achievements.length,
            progress: {
                tokens: progress?.totalTokens || 0,
                playtime: progress?.totalPlayTime || 0,
                perfectLevels,
                currentLevel: progress?.currentLevel || 1,
            },
        };
    }

    /**
     * Get all available achievements
     */
    async getAllAchievements() {
        return Object.entries(ACHIEVEMENTS).map(([key, id]) => ({
            id,
            name: key.replace(/_/g, ' ').toLowerCase(),
            description: this.getAchievementDescription(id),
        }));
    }

    /**
     * Helper: Get achievement description
     */
    private getAchievementDescription(achievementId: string): string {
        const descriptions: Record<string, string> = {
            [ACHIEVEMENTS.FIRST_LEVEL]: 'Complete your first level',
            [ACHIEVEMENTS.LEVEL_10]: 'Reach level 10',
            [ACHIEVEMENTS.LEVEL_25]: 'Reach level 25',
            [ACHIEVEMENTS.LEVEL_50]: 'Reach level 50',
            [ACHIEVEMENTS.LEVEL_100]: 'Complete all 100 levels',
            [ACHIEVEMENTS.SPEED_DEMON]: 'Complete a level in under 30 seconds',
            [ACHIEVEMENTS.PERFECTIONIST]: 'Complete 10 levels without hints',
            [ACHIEVEMENTS.TOKEN_COLLECTOR]: 'Earn 1,000 tokens',
            [ACHIEVEMENTS.TOKEN_MASTER]: 'Earn 5,000 tokens',
            [ACHIEVEMENTS.NO_HINTS]: 'Complete 5 levels without hints in a row',
            [ACHIEVEMENTS.MARATHON]: 'Play for 1 hour total',
            [ACHIEVEMENTS.DEDICATED]: 'Play for 10 hours total',
        };

        return descriptions[achievementId] || 'Unknown achievement';
    }
}

export default new AchievementService();
