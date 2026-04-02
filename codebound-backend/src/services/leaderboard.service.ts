import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';

interface LeaderboardQuery {
    limit?: number;
    offset?: number;
    sort?: 'level' | 'tokens' | 'playtime' | 'recent';
}

class LeaderboardService {
    /**
     * Get global leaderboard
     */
    async getLeaderboard({ limit = 50, offset = 0, sort = 'level' }: LeaderboardQuery) {
        // Validate limit
        const validLimit = Math.min(Math.max(1, parseInt(limit.toString())), 100);
        const validOffset = Math.max(0, parseInt(offset.toString()));

        // Determine sort order
        const orderBy = this.getSortOrder(sort);

        // Query userProgress table with pagination, joined with user for username
        const players = await prisma.userProgress.findMany({
            take: validLimit,
            skip: validOffset,
            orderBy,
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                        created_at: true,
                        achievements: true,
                    }
                }
            }
        });

        // Get total count
        const totalPlayers = await prisma.userProgress.count();

        // Format response with ranks (ensure API contract matches frontend LeaderboardEntry)
        const formattedPlayers = players.map((player, index) => ({
            rank: validOffset + index + 1,
            userId: player.userId,
            username: player.user.username,
            avatar: player.user.avatar || null,
            levelReached: player.highestLevel,
            tokensEarned: player.totalTokens,
            achievementsCount: player.user.achievements.length || 0,
            totalTimePlayed: player.totalPlayTime || 0,
            lastPlayed: player.lastPlayed,
            memberSince: player.user.created_at,
        }));

        return {
            players: formattedPlayers,
            pagination: {
                total: totalPlayers,
                limit: validLimit,
                offset: validOffset,
                hasMore: validOffset + validLimit < totalPlayers,
            },
        };
    }

    /**
     * Get top N players
     */
    async getTopPlayers(count = 10) {
        const validCount = Math.min(Math.max(1, parseInt(count.toString())), 100);

        const topPlayers = await prisma.userProgress.findMany({
            take: validCount,
            orderBy: [
                { highestLevel: 'desc' },
                { totalTokens: 'desc' },
            ],
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                } // Achievements are heavy, drop out of Top N optimization since it's not strictly necessary in frontend Top 10 lists unless needed
            }
        });

        return topPlayers.map((player, index) => ({
            rank: index + 1,
            userId: player.userId,
            username: player.user.username,
            avatar: player.user.avatar || null,
            levelReached: player.highestLevel,
            tokensEarned: player.totalTokens,
            lastPlayed: player.lastPlayed,
        }));
    }

    /**
     * Get player's rank
     */
    async getPlayerRank(userId: string) {
        // Get player's leaderboard row
        const playerProgress = await prisma.userProgress.findUnique({
            where: { userId },
        });

        if (!playerProgress) {
            throw new HttpError(404, 'Player not found');
        }

        // Count players with better scores
        const betterPlayersCount = await prisma.userProgress.count({
            where: {
                OR: [
                    { highestLevel: { gt: playerProgress.highestLevel } },
                    {
                        AND: [
                            { highestLevel: playerProgress.highestLevel },
                            { totalTokens: { gt: playerProgress.totalTokens } },
                        ],
                    },
                ],
            },
        });

        return betterPlayersCount + 1; // Rank is count + 1
    }

    /**
     * Get leaderboard around a specific player
     */
    async getLeaderboardAroundPlayer(userId: string, range = 10) {
        const playerRank = await this.getPlayerRank(userId);
        const offset = Math.max(0, playerRank - Math.floor(range / 2) - 1);

        return this.getLeaderboard({ limit: range, offset });
    }

    /**
     * Get leaderboard statistics
     */
    async getLeaderboardStats() {
        const stats = await prisma.userProgress.aggregate({
            _count: { id: true },
            _avg: {
                highestLevel: true,
                totalTokens: true,
                totalPlayTime: true
            },
            _max: {
                highestLevel: true,
                totalTokens: true,
            },
        });

        const downloadCounter = await prisma.downloadCounter.findFirst({
            orderBy: { updated_at: 'desc' },
        });

        // Get most active players
        const mostActivePlayers = await prisma.userProgress.findMany({
            take: 5,
            orderBy: [{ highestLevel: 'desc' }, { totalTokens: 'desc' }],
            include: {
                user: {
                    select: { username: true }
                }
            }
        });

        return {
            totalPlayers: stats._count.id,
            averageLevel: Math.round(stats._avg.highestLevel || 0),
            averageTokens: Math.round(stats._avg.totalTokens || 0),
            averagePlaytime: 0, // Fallback since it wasn't recorded nicely in leaderboard table before
            highestLevel: stats._max.highestLevel || 0,
            mostTokens: stats._max.totalTokens || 0,
            totalDownloads: downloadCounter?.totalDownloads || 0,
            mostActivePlayers: mostActivePlayers.map((p) => ({
                username: p.user.username,
                playtime: p.totalPlayTime,
            })),
        };
    }

    /**
     * Helper: Get sort order based on parameter
     */
    private getSortOrder(sort: string): Prisma.UserProgressOrderByWithRelationInput[] {
        const sortOptions: Record<string, Prisma.UserProgressOrderByWithRelationInput[]> = {
            level: [
                { highestLevel: 'desc' },
                { totalTokens: 'desc' },
                { totalPlayTime: 'desc' }, // Replaced achievements count via UserProgress fields mapping
            ],
            tokens: [
                { totalTokens: 'desc' },
                { highestLevel: 'desc' },
                { totalPlayTime: 'asc' },
            ],
            playtime: [
                { totalPlayTime: 'desc' },
                { highestLevel: 'desc' },
            ],
            recent: [{ lastPlayed: 'desc' }],
        };

        return sortOptions[sort] || sortOptions.level;
    }
}

export default new LeaderboardService();
