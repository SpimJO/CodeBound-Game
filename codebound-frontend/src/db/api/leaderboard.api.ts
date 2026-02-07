import api from "@/http/xior";
import type {
    ApiResponse,
    LeaderboardResponse,
    LeaderboardStats,
    LeaderboardPlayer,
} from "@/types/api.types";

export const leaderboardApi = {
    getLeaderboard: async (
        limit: number = 50,
        offset: number = 0,
        sort: 'level' | 'tokens' | 'playtime' | 'recent' = 'level'
    ): Promise<ApiResponse<LeaderboardResponse>> => {
        const response = await api.get(`/leaderboard?limit=${limit}&offset=${offset}&sort=${sort}`);
        return response.data;
    },

    getTopPlayers: async (count: number = 10): Promise<ApiResponse<LeaderboardPlayer[]>> => {
        const response = await api.get(`/leaderboard/top/${count}`);
        return response.data;
    },

    getPlayerRank: async (): Promise<ApiResponse<{ rank: number }>> => {
        const response = await api.get("/leaderboard/rank");
        return response.data;
    },

    getLeaderboardAroundPlayer: async (range: number = 10): Promise<ApiResponse<LeaderboardResponse>> => {
        const response = await api.get(`/leaderboard/around-me?range=${range}`);
        return response.data;
    },

    getLeaderboardStats: async (): Promise<ApiResponse<LeaderboardStats>> => {
        const response = await api.get("/leaderboard/stats");
        return response.data;
    },
};
