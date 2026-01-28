import { authApi } from "@/db/api/auth.api";
import { redirect } from "@tanstack/react-router";

interface AuthSuccessResponse {
    [key: string]: any;
}

export const authMiddleware = async (pathname: string): Promise<AuthSuccessResponse | null> => {
    if (pathname === "/" || pathname === "/login") {
        return null;
    }

    try {
        const response = await authApi.session();

        return response.data;
    } catch (error: any) {
        // NOTE: You may modify this based on how your API indicates an unauthenticated user
        if (error.response?.status === 401) {
            throw redirect({
                to: "/",
                search: { redirect: pathname },
            });
        }

        throw error;
    }
}