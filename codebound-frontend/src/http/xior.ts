import xior from "xior";
import { getAuthToken } from "@/utils/auth";

const api = xior.create({
    baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

// Request interceptor: Add auth token and API key
api.interceptors.request.use(
    (config) => {
        // Get token from cookies directly (not using hook)
        const token = getAuthToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['api-key'] = import.meta.env.VITE_API_KEY;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;