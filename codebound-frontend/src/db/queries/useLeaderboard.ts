import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard.api';

// Query keys
export const leaderboardKeys = {
    all: ['leaderboard'] as const,
    list: (limit?: number, offset?: number, sort?: string) => 
        [...leaderboardKeys.all, 'list', limit, offset, sort] as const,
    top: (count?: number) => [...leaderboardKeys.all, 'top', count] as const,
    rank: () => [...leaderboardKeys.all, 'rank'] as const,
    aroundMe: (range?: number) => [...leaderboardKeys.all, 'aroundMe', range] as const,
    stats: () => [...leaderboardKeys.all, 'stats'] as const,
};

// Get leaderboard
export const useLeaderboard = (
    limit: number = 50,
    offset: number = 0,
    sort: 'level' | 'tokens' | 'playtime' | 'recent' = 'level'
) => {
    return useQuery({
        queryKey: leaderboardKeys.list(limit, offset, sort),
        queryFn: async () => {
            const response = await leaderboardApi.getLeaderboard(limit, offset, sort);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Get top players
export const useTopPlayers = (count: number = 10) => {
    return useQuery({
        queryKey: leaderboardKeys.top(count),
        queryFn: async () => {
            const response = await leaderboardApi.getTopPlayers(count);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Get player rank
export const usePlayerRank = () => {
    return useQuery({
        queryKey: leaderboardKeys.rank(),
        queryFn: async () => {
            const response = await leaderboardApi.getPlayerRank();
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Get leaderboard around player
export const useLeaderboardAroundPlayer = (range: number = 10) => {
    return useQuery({
        queryKey: leaderboardKeys.aroundMe(range),
        queryFn: async () => {
            const response = await leaderboardApi.getLeaderboardAroundPlayer(range);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Get leaderboard stats
export const useLeaderboardStats = () => {
    return useQuery({
        queryKey: leaderboardKeys.stats(),
        queryFn: async () => {
            const response = await leaderboardApi.getLeaderboardStats();
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};
