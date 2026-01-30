import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadCount, incrementDownload, getPlayerStats } from "../api/analytics.api";

export const useDownloadCount = () => {
  return useQuery({
    queryKey: ["download-count"],
    queryFn: getDownloadCount,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useIncrementDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementDownload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["download-count"] });
    },
  });
};

export const usePlayerStats = () => {
  return useQuery({
    queryKey: ["player-stats"],
    queryFn: getPlayerStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
