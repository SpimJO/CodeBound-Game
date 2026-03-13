import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';

interface LeaderboardQuery {
    limit?: number;
    offset?: number;
    sort?: 'level' | 'tokens' | 'playtime' | 'recent';
}

class LeaderboardService {
    private async getUserAvatarMap(userIds: string[]) {
        if (userIds.length === 0) return new Map<string, string | null>();

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, avatar: true },
        });

        return new Map(users.map((u) => [u.id, u.avatar]));
    }

    /**
     * Get global leaderboard
     */
    async getLeaderboard({ limit = 50, offset = 0, sort = 'level' }: LeaderboardQuery) {
        // Validate limit
        const validLimit = Math.min(Math.max(1, parseInt(limit.toString())), 100);
        const validOffset = Math.max(0, parseInt(offset.toString()));

        // Determine sort order
        const orderBy = this.getSortOrder(sort);

        // Query leaderboard table with pagination
        const players = await prisma.leaderboard.findMany({
            take: validLimit,
            skip: validOffset,
            orderBy,
        });

        // Get total count
        const totalPlayers = await prisma.leaderboard.count();

        const avatarMap = await this.getUserAvatarMap(players.map((p) => p.userId));

        // Format response with ranks
        const formattedPlayers = players.map((player, index) => ({
            rank: validOffset + index + 1,
            userId: player.userId,
            username: player.username,
            avatar: avatarMap.get(player.userId) || null,
            levelReached: player.highestLevel,
            tokensEarned: player.totalTokens,
            achievementsCount: player.achievementsCount || 0,
            totalTimePlayed: 0,
            lastPlayed: player.lastUpdated,
            memberSince: player.lastUpdated,
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

        const topPlayers = await prisma.leaderboard.findMany({
            take: validCount,
            orderBy: [
                { highestLevel: 'desc' },
                { totalTokens: 'desc' },
                { achievementsCount: 'desc' },
            ],
        });

        const avatarMap = await this.getUserAvatarMap(topPlayers.map((p) => p.userId));

        return topPlayers.map((player, index) => ({
            rank: index + 1,
            userId: player.userId,
            username: player.username,
            avatar: avatarMap.get(player.userId) || null,
            levelReached: player.highestLevel,
            tokensEarned: player.totalTokens,
            lastPlayed: player.lastUpdated,
        }));
    }

    /**
     * Get player's rank
     */
    async getPlayerRank(userId: string) {
        // Get player's leaderboard row
        const playerProgress = await prisma.leaderboard.findUnique({
            where: { userId },
        });

        if (!playerProgress) {
            throw new HttpError(404, 'Player leaderboard not found');
        }

        // Count players with better scores
        const betterPlayersCount = await prisma.leaderboard.count({
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
        const stats = await prisma.leaderboard.aggregate({
            _count: { id: true },
            _avg: {
                highestLevel: true,
                totalTokens: true,
            },
            _max: {
                highestLevel: true,
                totalTokens: true,
            },
        });

        // Get most active players (fallback: using highestLevel + totalTokens)
        const mostActivePlayers = await prisma.leaderboard.findMany({
            take: 5,
            orderBy: [{ highestLevel: 'desc' }, { totalTokens: 'desc' }],
        });

        return {
            totalPlayers: stats._count.id,
            averageLevel: Math.round(stats._avg.highestLevel || 0),
            averageTokens: Math.round(stats._avg.totalTokens || 0),
            averagePlaytime: 0,
            highestLevel: stats._max.highestLevel || 0,
            mostTokens: stats._max.totalTokens || 0,
            mostActivePlayers: mostActivePlayers.map((p) => ({
                username: p.username,
                playtime: 0,
            })),
        };
    }

    /**
     * Helper: Get sort order based on parameter
     */
    private getSortOrder(sort: string): Prisma.LeaderboardOrderByWithRelationInput[] {
        const sortOptions: Record<string, Prisma.LeaderboardOrderByWithRelationInput[]> = {
            level: [
                { highestLevel: 'desc' },
                { totalTokens: 'desc' },
                { achievementsCount: 'desc' },
            ],
            tokens: [
                { totalTokens: 'desc' },
                { highestLevel: 'desc' },
                { achievementsCount: 'desc' },
            ],
            playtime: [
                { highestLevel: 'desc' },
                { totalTokens: 'desc' },
                { highestLevel: 'desc' },
            ],
            recent: [{ lastUpdated: 'desc' }],
        };

        return sortOptions[sort] || sortOptions.level;
    }
}

export default new LeaderboardService();
