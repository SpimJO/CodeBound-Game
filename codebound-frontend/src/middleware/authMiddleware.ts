import { authApi } from "@/db/api/auth.api";
import { redirect } from "@tanstack/react-router";

interface AuthSuccessResponse {
    [key: string]: unknown;
}

export const authMiddleware = async (pathname: string): Promise<AuthSuccessResponse | null> => {
    const publicPaths = ["/", "/auth/login", "/auth/register"];
    if (publicPaths.includes(pathname)) {
        return null;
    }

    try {
        const response = await authApi.sessionToken();

        return response.data;
    } catch (error) {
        // NOTE: You may modify this based on how your API indicates an unauthenticated user
        if (error && typeof error === 'object' && 'response' in error) {
            const httpError = error as { response?: { status?: number } };
            if (httpError.response?.status === 401) {
                throw redirect({
                    to: "/",
                    search: { redirect: pathname },
                });
            }
        }

        throw error;
    }
}