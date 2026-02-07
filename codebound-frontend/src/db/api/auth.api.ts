import api from "@/http/xior";
import type { 
    AuthResponse, 
    LoginRequest, 
    RegisterRequest,
    SessionResponse,
    UpdateProfileRequest 
} from "@/types/api.types";

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post("/auth/login", data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    sessionToken: async (): Promise<SessionResponse> => {
        const response = await api.post("/auth/sessionToken");
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<{ success: boolean; message: string; data: { user: User } }> => {
        const response = await api.put("/auth/profile", data);
        return response.data;
    },
};