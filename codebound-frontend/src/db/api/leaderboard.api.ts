import xior from "@/http/xior";

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  highestLevel: number;
  totalTokens: number;
  achievementsCount: number;
  lastUpdated: string;
}

export interface LeaderboardResponse {
  entries: (LeaderboardEntry & { rank: number })[];
  total: number;
}

export const getLeaderboard = async (limit = 100): Promise<LeaderboardResponse> => {
  const { data } = await xior.get(`/api/v1/leaderboard?limit=${limit}`);
  return data.data;
};

export const getMyRank = async (): Promise<{ rank: number; entry: LeaderboardEntry }> => {
  const { data } = await xior.get(`/api/v1/leaderboard/me`);
  return data.data;
};
