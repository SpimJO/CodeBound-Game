import api from "@/http/xior";
import type {
    ApiResponse,
    DownloadCounter,
    PlatformStats,
    LevelStat,
} from "@/types/api.types";

export const analyticsApi = {
    getDownloadCount: async (): Promise<ApiResponse<DownloadCounter>> => {
        const response = await api.get("/analytics/downloads");
        return response.data;
    },

    incrementDownload: async (): Promise<ApiResponse<DownloadCounter>> => {
        const response = await api.post("/analytics/downloads/increment");
        return response.data;
    },

    getPlatformStats: async (): Promise<ApiResponse<PlatformStats>> => {
        const response = await api.get("/analytics/platform");
        return response.data;
    },

    getLevelStats: async (): Promise<ApiResponse<LevelStat[]>> => {
        const response = await api.get("/analytics/levels");
        return response.data;
    },
};
