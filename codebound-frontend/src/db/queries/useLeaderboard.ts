import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, getMyRank } from "../api/leaderboard.api";

export const useLeaderboard = (limit = 100) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => getLeaderboard(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useMyRank = () => {
  return useQuery({
    queryKey: ["leaderboard", "me"],
    queryFn: getMyRank,
    enabled: false, // Only fetch when user is logged in
    staleTime: 5 * 60 * 1000,
  });
};
