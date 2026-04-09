import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';
import achievementService from './achievement.service';

const REPLAY_REWARD_TOKENS = 30;

interface LevelData {
    levelCompleted: number;
    tokensEarned: number;
    timeSpent: number;
    hintsUsed: number;
    isPerfect?: boolean;
    hasCodeErrors?: boolean;
}

class ProgressService {
    /**
     * Update player progress after level completion
     */
    async updateProgress(userId: string, levelData: LevelData) {
        const {
            levelCompleted,
            tokensEarned,
            timeSpent,
            hintsUsed,
            isPerfect = false,
            hasCodeErrors = false,
        } = levelData;

        if (!Number.isInteger(levelCompleted)) {
            throw new HttpError(400, 'levelCompleted must be an integer');
        }

        if (tokensEarned < 0 || timeSpent < 0 || hintsUsed < 0) {
            throw new HttpError(400, 'tokensEarned, timeSpent, and hintsUsed must be >= 0');
        }

        if (hasCodeErrors) {
            throw new HttpError(400, 'Level cannot be completed when terminal run has code errors');
        }

        // Validate level number
        if (levelCompleted < 1 || levelCompleted > 100) {
            throw new HttpError(400, 'Invalid level number');
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get current progress
            let progress = await tx.userProgress.findUnique({
                where: { userId },
            });

            // Create progress if doesn't exist
            if (!progress) {
                progress = await tx.userProgress.create({
                    data: {
                        userId,
                        currentLevel: 1,
                        highestLevel: 1,
                        totalTokens: 0,
                        totalPlayTime: 0,
                    },
                });
            }

            // Enforce sequential progression for first-time completion.
            // Allowed:
            // - replaying an already completed level
            // - completing exactly the next unlocked level (highestLevel + 1)
            // Rejected:
            // - skipping ahead to future levels
            if (levelCompleted > progress.highestLevel + 1) {
                throw new HttpError(
                    400,
                    `Level ${levelCompleted} is locked. Complete level ${progress.highestLevel + 1} first`
                );
            }

            // Check if level already completed
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

            // Create or update level completion
            if (existingCompletion) {
                // Replays always award a fixed token bonus.
                // This keeps repeat clears rewarding while avoiding duplicate full rewards.
                rewardTokens = REPLAY_REWARD_TOKENS;
                tokenDelta = rewardTokens;

                // Update if better performance
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
                        timeSpent: Math.min(existingCompletion.timeSpent, timeSpent),
                        hintsUsed: Math.min(existingCompletion.hintsUsed, hintsUsed),
                        isPerfect: existingCompletion.isPerfect || isPerfect,
                        completedAt: new Date(),
                    },
                });
            } else {
                // Create new completion record
                await tx.levelCompletion.create({
                    data: {
                        userId,
                        levelNumber: levelCompleted,
                        tokensEarned,
                        attemptsCount: 1,
                        timeSpent,
                        hintsUsed,
                        isPerfect,
                    },
                });
            }

            // Update progress
            const updatedProgress = await tx.userProgress.update({
                where: { userId },
                data: {
                    currentLevel: Math.min(100, Math.max(progress.currentLevel, levelCompleted + 1)),
                    highestLevel: Math.max(progress.highestLevel, levelCompleted),
                    totalTokens: progress.totalTokens + tokenDelta,
                    totalPlayTime: progress.totalPlayTime + timeSpent,
                    lastPlayed: new Date(),
                },
            });

            return {
                ...updatedProgress,
                rewardTokens,
            };
        });

        // Check for achievements (outside transaction for better performance)
        await achievementService.checkAndUnlockAchievements(userId, {
            levelCompleted,
            tokensEarned,
            timeSpent,
            hintsUsed,
            isPerfect,
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
                        avatar: true,
                        created_at: true,
                    },
                },
            },
        });

        if (!progress) {
            throw new HttpError(404, 'Progress not found');
        }

        // Get completed levels count
        const completedLevelsCount = await prisma.levelCompletion.count({
            where: { userId },
        });

        // Get achievements count
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

        // Calculate statistics
        const totalLevelsCompleted = levelCompletions.length;
        const totalTimeSpent = levelCompletions.reduce((sum, l) => sum + l.timeSpent, 0);
        const totalHints = levelCompletions.reduce((sum, l) => sum + l.hintsUsed, 0);

        const averageTimePerLevel =
            totalLevelsCompleted > 0 ? totalTimeSpent / totalLevelsCompleted : 0;

        const averageHintsPerLevel =
            totalLevelsCompleted > 0 ? totalHints / totalLevelsCompleted : 0;

        const fastestCompletion =
            levelCompletions.length > 0
                ? Math.min(...levelCompletions.map((l) => l.timeSpent))
                : 0;

        const slowestCompletion =
            levelCompletions.length > 0
                ? Math.max(...levelCompletions.map((l) => l.timeSpent))
                : 0;

        const perfectLevels = levelCompletions.filter((l) => l.isPerfect).length;

        return {
            currentLevel: progress.currentLevel,
            highestLevel: progress.highestLevel,
            totalTokens: progress.totalTokens,
            totalPlayTime: progress.totalPlayTime,
            totalLevelsCompleted,
            achievementsUnlocked: achievements,
            averageTimePerLevel: Math.round(averageTimePerLevel),
            averageHintsPerLevel: Math.round(averageHintsPerLevel * 100) / 100,
            fastestCompletion,
            slowestCompletion,
            perfectLevels,
            lastPlayed: progress.lastPlayed,
        };
    }

    /**
     * Reset player progress (admin only)
     */
    async resetProgress(userId: string) {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { username: true },
            });

            await tx.levelCompletion.deleteMany({ where: { userId } });
            await tx.userAchievement.deleteMany({ where: { userId } });
            await tx.userProgress.update({
                where: { userId },
                data: {
                    currentLevel: 1,
                    highestLevel: 1,
                    totalTokens: 0,
                    totalPlayTime: 0,
                    lastPlayed: new Date(),
                    equippedCharacter: 'default',
                },
            });

        });

        return { message: 'Progress reset successfully' };
    }

    /**
     * Sync overworld coin tokens collected by the player.
     * POST /progress/sync-tokens
     * Safely adds tokensToAdd to totalTokens without touching level data.
     */
    async syncTokens(userId: string, tokensToAdd: number) {
        if (!Number.isInteger(tokensToAdd) || tokensToAdd < 0) {
            throw new HttpError(400, 'tokensToAdd must be a non-negative integer');
        }

        if (tokensToAdd === 0) {
            // No-op: return current progress without a DB write
            const current = await prisma.userProgress.findUnique({ where: { userId } });
            if (!current) throw new HttpError(404, 'Progress not found');
            return current;
        }

        const result = await prisma.$transaction(async (tx) => {
            // Upsert progress row in case it hasn't been created yet
            let progress = await tx.userProgress.findUnique({ where: { userId } });
            if (!progress) {
                progress = await tx.userProgress.create({
                    data: { userId, currentLevel: 1, highestLevel: 1, totalTokens: 0, totalPlayTime: 0 },
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
