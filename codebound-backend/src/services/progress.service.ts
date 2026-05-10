import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';
import achievementService from './achievement.service';

const REPLAY_REWARD_TOKENS = 30;

interface LevelData {
    levelCompleted: number;
    tokensEarned: number;
    hasCodeErrors?: boolean;
}

class ProgressService {
    /**
     * Update player progress after level completion
     */
    async updateProgress(userId: string, levelData: LevelData) {
        const { levelCompleted, tokensEarned, hasCodeErrors = false } = levelData;

        if (!Number.isInteger(levelCompleted)) {
            throw new HttpError(400, 'levelCompleted must be an integer');
        }

        if (tokensEarned < 0) {
            throw new HttpError(400, 'tokensEarned must be >= 0');
        }

        if (hasCodeErrors) {
            throw new HttpError(400, 'Level cannot be completed when terminal run has code errors');
        }

        if (levelCompleted < 1 || levelCompleted > 100) {
            throw new HttpError(400, 'Invalid level number');
        }

        const result = await prisma.$transaction(async (tx) => {
            let progress = await tx.userProgress.findUnique({
                where: { userId },
            });

            if (!progress) {
                progress = await tx.userProgress.create({
                    data: {
                        userId,
                        currentLevel: 1,
                        highestLevel: 1,
                        totalTokens: 0,
                    },
                });
            }

            if (levelCompleted > progress.highestLevel + 1) {
                throw new HttpError(
                    400,
                    `Level ${levelCompleted} is locked. Complete level ${progress.highestLevel + 1} first`,
                );
            }

            const existingCompletion = await tx.levelCompletion.findUnique({
                where: {
                    userId_levelNumber: {
                        userId,
                        levelNumber: levelCompleted,
                    },
                },
            });

            let tokenDelta = tokensEarned;
            let rewardTokens = tokensEarned;

            if (existingCompletion) {
                rewardTokens = REPLAY_REWARD_TOKENS;
                tokenDelta = rewardTokens;

                await tx.levelCompletion.update({
                    where: {
                        userId_levelNumber: {
                            userId,
                            levelNumber: levelCompleted,
                        },
                    },
                    data: {
                        tokensEarned: Math.max(existingCompletion.tokensEarned, tokensEarned),
                        attemptsCount: existingCompletion.attemptsCount + 1,
                        completedAt: new Date(),
                    },
                });
            } else {
                await tx.levelCompletion.create({
                    data: {
                        userId,
                        levelNumber: levelCompleted,
                        tokensEarned,
                        attemptsCount: 1,
                    },
                });
            }

            const updatedProgress = await tx.userProgress.update({
                where: { userId },
                data: {
                    currentLevel: Math.min(100, Math.max(progress.currentLevel, levelCompleted + 1)),
                    highestLevel: Math.max(progress.highestLevel, levelCompleted),
                    totalTokens: progress.totalTokens + tokenDelta,
                    lastPlayed: new Date(),
                },
            });

            return {
                ...updatedProgress,
                rewardTokens,
            };
        });

        await achievementService.checkAndUnlockAchievements(userId, {
            levelCompleted,
            tokensEarned,
        });

        return result;
    }

    /**
     * Get player progress
     */
    async getProgress(userId: string) {
        const progress = await prisma.userProgress.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        created_at: true,
                    },
                },
            },
        });

        if (!progress) {
            throw new HttpError(404, 'Progress not found');
        }

        const completedLevelsCount = await prisma.levelCompletion.count({
            where: { userId },
        });

        const achievementsCount = await prisma.userAchievement.count({
            where: { userId },
        });

        return {
            ...progress,
            completedLevelsCount,
            achievementsCount,
        };
    }

    /**
     * Get level completion details
     */
    async getLevelCompletions(userId: string, limit = 10) {
        const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
        const completions = await prisma.levelCompletion.findMany({
            where: { userId },
            orderBy: { completedAt: 'desc' },
            take: safeLimit,
        });

        return completions;
    }

    /**
     * Get player statistics
     */
    async getPlayerStats(userId: string) {
        const [progress, levelCompletions, achievements] = await Promise.all([
            prisma.userProgress.findUnique({ where: { userId } }),
            prisma.levelCompletion.findMany({ where: { userId } }),
            prisma.userAchievement.count({ where: { userId } }),
        ]);

        if (!progress) {
            throw new HttpError(404, 'Player not found');
        }

        const totalLevelsCompleted = levelCompletions.length;

        return {
            currentLevel: progress.currentLevel,
            highestLevel: progress.highestLevel,
            totalTokens: progress.totalTokens,
            tokensEarned: progress.totalTokens,
            totalLevelsCompleted,
            achievementsUnlocked: achievements,
            lastPlayed: progress.lastPlayed,
        };
    }

    /**
     * Reset player progress (admin only)
     */
    async resetProgress(userId: string) {
        await prisma.$transaction(async (tx) => {
            await tx.levelCompletion.deleteMany({ where: { userId } });
            await tx.userAchievement.deleteMany({ where: { userId } });
            await tx.userProgress.update({
                where: { userId },
                data: {
                    currentLevel: 1,
                    highestLevel: 1,
                    totalTokens: 0,
                    lastPlayed: new Date(),
                    equippedCharacter: 'default',
                },
            });
        });

        return { message: 'Progress reset successfully' };
    }

    /**
     * Sync overworld coin tokens collected by the player.
     */
    async syncTokens(userId: string, tokensToAdd: number) {
        if (!Number.isInteger(tokensToAdd) || tokensToAdd < 0) {
            throw new HttpError(400, 'tokensToAdd must be a non-negative integer');
        }

        if (tokensToAdd === 0) {
            const current = await prisma.userProgress.findUnique({ where: { userId } });
            if (!current) throw new HttpError(404, 'Progress not found');
            return current;
        }

        const result = await prisma.$transaction(async (tx) => {
            let progress = await tx.userProgress.findUnique({ where: { userId } });
            if (!progress) {
                progress = await tx.userProgress.create({
                    data: { userId, currentLevel: 1, highestLevel: 1, totalTokens: 0 },
                });
            }

            const updated = await tx.userProgress.update({
                where: { userId },
                data: {
                    totalTokens: progress.totalTokens + tokensToAdd,
                    lastPlayed: new Date(),
                },
            });

            return updated;
        });

        return result;
    }
}

export default new ProgressService();
