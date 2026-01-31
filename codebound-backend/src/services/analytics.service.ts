import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AnalyticsService {
    /**
     * Increment download counter
     */
    async incrementDownloads() {
        const counter = await prisma.downloadCounter.upsert({
            where: { id: 'main' },
            create: {
                id: 'main',
                totalDownloads: 1,
            },
            update: {
                totalDownloads: { increment: 1 },
                lastIncrement: new Date(),
            },
        });

        return counter;
    }

    /**
     * Get download statistics
     */
    async getDownloadStats() {
        const counter = await prisma.downloadCounter.findUnique({
            where: { id: 'main' },
        });

        return {
            totalDownloads: counter?.totalDownloads || 0,
            lastIncrement: counter?.lastIncrement,
        };
    }

    /**
     * Get platform statistics
     */
    async getPlatformStats() {
        const [
            totalUsers,
            totalLevelsCompleted,
            totalTokensEarned,
            totalPlayTime,
            activeToday,
            activeThisWeek,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.levelCompletion.count(),
            prisma.userProgress.aggregate({
                _sum: { totalTokens: true },
            }),
            prisma.userProgress.aggregate({
                _sum: { totalPlayTime: true },
            }),
            prisma.userProgress.count({
                where: {
                    lastPlayed: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    },
                },
            }),
            prisma.userProgress.count({
                where: {
                    lastPlayed: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);

        const downloads = await this.getDownloadStats();

        return {
            totalUsers,
            totalDownloads: downloads.totalDownloads,
            totalLevelsCompleted,
            totalTokensEarned: totalTokensEarned._sum.totalTokens || 0,
            totalPlayTime: totalPlayTime._sum.totalPlayTime || 0,
            activePlayersToday: activeToday,
            activePlayersThisWeek: activeThisWeek,
        };
    }

    /**
     * Get level statistics
     */
    async getLevelStats() {
        const levelStats = await prisma.levelCompletion.groupBy({
            by: ['levelNumber'],
            _count: {
                id: true,
            },
            _avg: {
                timeSpent: true,
                tokensEarned: true,
                hintsUsed: true,
            },
            orderBy: {
                levelNumber: 'asc',
            },
        });

        return levelStats.map((stat) => ({
            level: stat.levelNumber,
            completions: stat._count.id,
            averageTime: Math.round(stat._avg.timeSpent || 0),
            averageTokens: Math.round(stat._avg.tokensEarned || 0),
            averageHints: Math.round((stat._avg.hintsUsed || 0) * 100) / 100,
        }));
    }

    /**
     * Get user engagement metrics
     */
    async getEngagementMetrics() {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [dailyActive, weeklyActive, monthlyActive, newUsers, returningUsers] =
            await Promise.all([
                prisma.userProgress.count({
                    where: { lastPlayed: { gte: yesterday } },
                }),
                prisma.userProgress.count({
                    where: { lastPlayed: { gte: lastWeek } },
                }),
                prisma.userProgress.count({
                    where: { lastPlayed: { gte: lastMonth } },
                }),
                prisma.user.count({
                    where: { created_at: { gte: lastWeek } },
                }),
                prisma.userProgress.count({
                    where: {
                        lastPlayed: { gte: yesterday },
                        created_at: { lt: lastWeek },
                    },
                }),
            ]);

        return {
            dailyActiveUsers: dailyActive,
            weeklyActiveUsers: weeklyActive,
            monthlyActiveUsers: monthlyActive,
            newUsersThisWeek: newUsers,
            returningUsers,
            retentionRate: weeklyActive > 0 ? (returningUsers / weeklyActive) * 100 : 0,
        };
    }
}

export default new AnalyticsService();
