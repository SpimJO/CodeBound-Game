import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';

interface AchievementData {
    levelCompleted?: number;
    tokensEarned?: number;
}

interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    rewardTokens: number;
    requiredHighestLevel?: number;
    requiredTotalTokens?: number;
}

const ACHIEVEMENTS: AchievementDefinition[] = [
    {
        id: 'welcome_gift',
        title: 'Welcome Gift Unlocked!',
        description: 'Enjoy 1,000 Free Tokens as a CodeBound pioneer.',
        rewardTokens: 1000,
    },
    {
        id: 'level_10_foundations',
        title: 'Mastered the foundations of Java',
        description: 'Complete all Basic Output and Syntax challenges. Complete Level 10',
        rewardTokens: 100,
        requiredHighestLevel: 10,
    },
    {
        id: 'level_20_variables',
        title: 'Variables and Data Types',
        description: 'Successfully demonstrated the proper use of Variables and various Data Types. Complete Level 20',
        rewardTokens: 100,
        requiredHighestLevel: 20,
    },
    {
        id: 'level_30_input',
        title: 'User Input',
        description: 'Proven ability to capture and process User Input within the terminal environment. Complete Level 30',
        rewardTokens: 100,
        requiredHighestLevel: 30,
    },
    {
        id: 'level_40_conditionals',
        title: 'Conditional Statements',
        description: 'Mastered decision-making logic through the use of Conditional Statements. Complete Level 40',
        rewardTokens: 100,
        requiredHighestLevel: 40,
    },
    {
        id: 'level_50_switch',
        title: 'Switch Statements',
        description: 'Efficiently handled multi-way branching using optimized Switch Statements. Complete Level 50',
        rewardTokens: 100,
        requiredHighestLevel: 50,
    },
    {
        id: 'level_60_loops_for',
        title: 'For Loop system',
        description: 'Controlled program flow using repetitive logic with the For Loop system. Complete Level 60',
        rewardTokens: 100,
        requiredHighestLevel: 60,
    },
    {
        id: 'level_70_loops_while',
        title: 'While Loops',
        description: 'Solved complex logic puzzles by implementing functional While Loops. Complete Level 70',
        rewardTokens: 100,
        requiredHighestLevel: 70,
    },
    {
        id: 'level_80_arrays',
        title: 'Arrays',
        description: 'Demonstrated proficiency in organizing and accessing data using Arrays. Complete Level 80',
        rewardTokens: 100,
        requiredHighestLevel: 80,
    },
    {
        id: 'level_90_strings',
        title: 'Java Strings',
        description: 'Mastered the art of handling, parsing, and formatting Java Strings. Complete Level 90',
        rewardTokens: 100,
        requiredHighestLevel: 90,
    },
    {
        id: 'level_100_methods',
        title: 'Methods and Functions',
        description: 'Final Milestone: Created modular and reusable code using Methods and Functions. Complete Level 100',
        rewardTokens: 100,
        requiredHighestLevel: 100,
    },
    {
        id: 'token_10000',
        title: 'Token Milestone 10,000',
        description: 'Accumulated a total of 10,000 tokens through successful puzzle completion.',
        rewardTokens: 500,
        requiredTotalTokens: 10000,
    },
    {
        id: 'token_100000',
        title: 'Token Milestone 100,000',
        description: 'Accumulated a total of 100,000 tokens through successful puzzle completion.',
        rewardTokens: 750,
        requiredTotalTokens: 100000,
    },
    {
        id: 'token_1000000',
        title: 'Token Milestone 1,000,000',
        description: 'Accumulated a total of 1,000,000 tokens through successful puzzle completion.',
        rewardTokens: 1000,
        requiredTotalTokens: 1000000,
    },
];

type UserAchievementRecord = {
    achievementId: string;
    progress: number | null;
    claimedAt: Date | null;
    unlockedAt: Date;
};

class AchievementService {
    private findDefinition(achievementId: string) {
        return ACHIEVEMENTS.find((achievement) => achievement.id === achievementId) ?? null;
    }

    private meetsRequirements(definition: AchievementDefinition, progress: { highestLevel: number; totalTokens: number }) {
        const levelOk = definition.requiredHighestLevel === undefined || progress.highestLevel >= definition.requiredHighestLevel;
        const tokensOk = definition.requiredTotalTokens === undefined || progress.totalTokens >= definition.requiredTotalTokens;
        return levelOk && tokensOk;
    }

    /**
     * Check and unlock achievements based on player actions
     */
    async checkAndUnlockAchievements(userId: string, data: AchievementData) {
        const progress = await prisma.userProgress.findUnique({ where: { userId } });
        if (!progress) {
            return [];
        }

        const achievementsToUnlock = new Set<string>();

        if (data.levelCompleted) {
            for (const definition of ACHIEVEMENTS) {
                if (definition.requiredHighestLevel !== undefined && data.levelCompleted >= definition.requiredHighestLevel) {
                    achievementsToUnlock.add(definition.id);
                }
            }
        }

        for (const definition of ACHIEVEMENTS) {
            if (this.meetsRequirements(definition, {
                highestLevel: progress.highestLevel,
                totalTokens: progress.totalTokens,
            })) {
                achievementsToUnlock.add(definition.id);
            }
        }

        const unlockedAchievements = [];
        for (const achievementId of achievementsToUnlock) {
            const achievement = await prisma.userAchievement.upsert({
                where: {
                    userId_achievementId: {
                        userId,
                        achievementId,
                    },
                },
                create: {
                    userId,
                    achievementId,
                    progress: 100,
                },
                update: {
                    progress: 100,
                },
            });

            unlockedAchievements.push(achievement);
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
     * Return the full achievement catalog for the game UI.
     */
    async getAllAchievements() {
        return ACHIEVEMENTS.map((achievement) => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            rewardTokens: achievement.rewardTokens,
            requiredHighestLevel: achievement.requiredHighestLevel ?? null,
            requiredTotalTokens: achievement.requiredTotalTokens ?? null,
        }));
    }

    /**
     * Get the current state of all achievements for one user.
     */
    async getAchievementState(userId: string) {
        const [progress, claimedAchievements] = await Promise.all([
            prisma.userProgress.findUnique({ where: { userId } }),
            prisma.userAchievement.findMany({ where: { userId } }),
        ]);

        const progressRecord = progress ?? await prisma.userProgress.create({
            data: {
                userId,
                currentLevel: 1,
                highestLevel: 1,
                totalTokens: 0,
            },
        });

        const claimedById = new Map<string, UserAchievementRecord>();
        for (const record of claimedAchievements as UserAchievementRecord[]) {
            claimedById.set(record.achievementId, record);
        }

        const achievements = ACHIEVEMENTS.map((definition) => {
            const record = claimedById.get(definition.id) ?? null;
            const eligible = this.meetsRequirements(definition, {
                highestLevel: progressRecord.highestLevel,
                totalTokens: progressRecord.totalTokens,
            });

            return {
                ...definition,
                isUnlocked: Boolean(record) || eligible,
                isClaimed: Boolean(record?.claimedAt),
                canClaim: eligible && !record?.claimedAt,
            };
        });

        return {
            progress: {
                currentLevel: progressRecord.currentLevel,
                highestLevel: progressRecord.highestLevel,
                totalTokens: progressRecord.totalTokens,
            },
            achievements,
            total: ACHIEVEMENTS.length,
            unlockedCount: achievements.filter((achievement) => achievement.isUnlocked).length,
            claimableCount: achievements.filter((achievement) => achievement.canClaim).length,
        };
    }

    /**
     * Claim an achievement reward and add its token payout to the user's progress.
     */
    async claimAchievement(userId: string, achievementId: string) {
        const definition = this.findDefinition(achievementId);
        if (!definition) {
            throw new HttpError(404, 'Achievement not found');
        }

        const result = await prisma.$transaction(async (tx) => {
            let progress = await tx.userProgress.findUnique({ where: { userId } });
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

            if (!this.meetsRequirements(definition, progress)) {
                throw new HttpError(400, 'Achievement is not yet claimable');
            }

            const existing = await tx.userAchievement.findUnique({
                where: {
                    userId_achievementId: {
                        userId,
                        achievementId,
                    },
                },
            });

            if (existing?.claimedAt) {
                throw new HttpError(409, 'Achievement already claimed');
            }

            const achievementRow = await tx.userAchievement.upsert({
                where: {
                    userId_achievementId: {
                        userId,
                        achievementId,
                    },
                },
                create: {
                    userId,
                    achievementId,
                    progress: 100,
                },
                update: {
                    progress: 100,
                },
            });

            const updatedProgress = await tx.userProgress.update({
                where: { userId },
                data: {
                    totalTokens: { increment: definition.rewardTokens },
                    lastPlayed: new Date(),
                },
            });

            const claimed = await tx.userAchievement.update({
                where: {
                    userId_achievementId: {
                        userId,
                        achievementId,
                    },
                },
                data: {
                    claimedAt: new Date(),
                },
            });

            return {
                achievement: claimed,
                progress: updatedProgress,
                rewardTokens: definition.rewardTokens,
                achievementRow,
            };
        });

        await this.checkAndUnlockAchievements(userId, {
            tokensEarned: 0,
        });

        return result;
    }
}

export default new AchievementService();
