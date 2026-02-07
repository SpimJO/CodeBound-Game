import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

// Query keys
export const analyticsKeys = {
    all: ['analytics'] as const,
    downloads: () => [...analyticsKeys.all, 'downloads'] as const,
    platformStats: () => [...analyticsKeys.all, 'platformStats'] as const,
    levelStats: () => [...analyticsKeys.all, 'levelStats'] as const,
};

// Get download count
export const useDownloadCount = () => {
    return useQuery({
        queryKey: analyticsKeys.downloads(),
        queryFn: async () => {
            const response = await analyticsApi.getDownloadCount();
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Get platform stats
export const usePlatformStats = () => {
    return useQuery({
        queryKey: analyticsKeys.platformStats(),
        queryFn: async () => {
            const response = await analyticsApi.getPlatformStats();
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Get level stats (completions per level)
export const useLevelStats = () => {
    return useQuery({
        queryKey: analyticsKeys.levelStats(),
        queryFn: async () => {
            const response = await analyticsApi.getLevelStats();
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// Increment download mutation
export const useIncrementDownload = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => analyticsApi.incrementDownload(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: analyticsKeys.downloads() });
        },
    });
};
