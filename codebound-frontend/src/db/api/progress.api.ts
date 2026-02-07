import api from "@/http/xior";
import type {
    ApiResponse,
    UpdateProgressRequest,
    ProgressWithDetails,
    LevelCompletion,
    ProgressStats,
} from "@/types/api.types";

export const progressApi = {
    updateProgress: async (data: UpdateProgressRequest): Promise<ApiResponse<ProgressWithDetails>> => {
        const response = await api.post("/progress/update", data);
        return response.data;
    },

    getProgress: async (): Promise<ApiResponse<ProgressWithDetails>> => {
        const response = await api.get("/progress");
        return response.data;
    },

    getLevelCompletions: async (limit: number = 10): Promise<ApiResponse<LevelCompletion[]>> => {
        const response = await api.get(`/progress/levels?limit=${limit}`);
        return response.data;
    },

    getPlayerStats: async (): Promise<ApiResponse<ProgressStats>> => {
        const response = await api.get("/progress/stats");
        return response.data;
    },

    resetProgress: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post("/progress/reset");
        return response.data;
    },
};
