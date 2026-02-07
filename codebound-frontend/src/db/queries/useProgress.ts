import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progress.api';
import type { UpdateProgressRequest } from '@/types/api.types';
import { HttpError, getErrorMessage } from '@/types/error.types';
import { toast } from 'sonner';

// Query keys
export const progressKeys = {
    all: ['progress'] as const,
    detail: () => [...progressKeys.all, 'detail'] as const,
    levels: (limit?: number) => [...progressKeys.all, 'levels', limit] as const,
    stats: () => [...progressKeys.all, 'stats'] as const,
};

// Get user progress
export const useProgress = () => {
    return useQuery({
        queryKey: progressKeys.detail(),
        queryFn: async () => {
            const response = await progressApi.getProgress();
            return response.data;
        },
    });
};

// Get level completions
export const useLevelCompletions = (limit: number = 10) => {
    return useQuery({
        queryKey: progressKeys.levels(limit),
        queryFn: async () => {
            const response = await progressApi.getLevelCompletions(limit);
            return response.data;
        },
    });
};

// Get player stats
export const usePlayerStats = () => {
    return useQuery({
        queryKey: progressKeys.stats(),
        queryFn: async () => {
            const response = await progressApi.getPlayerStats();
            return response.data;
        },
    });
};

// Update progress mutation
export const useUpdateProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProgressRequest) => progressApi.updateProgress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: progressKeys.all });
            toast.success('Progress updated successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to update progress');
        },
    });
};

// Reset progress mutation
export const useResetProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => progressApi.resetProgress(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: progressKeys.all });
            toast.success('Progress reset successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to reset progress');
        },
    });
};
