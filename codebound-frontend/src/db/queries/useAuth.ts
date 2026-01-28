import { authApi } from "../api/auth.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: authApi.login,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const sessionMutation = useMutation({
        mutationKey: ["auth", "session"],
        mutationFn: authApi.session,
    });

    const registerMutation = useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: authApi.register,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const clearAuthCache = () => {
        queryClient.removeQueries({ queryKey: ["auth"] });
    };

    const invalidateAuthCache = () => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
    };

    const clearAllCache = () => {
        queryClient.clear();
    };

    const invalidateAllQueries = () => {
        queryClient.invalidateQueries();
    };

    const resetAuthQueries = () => {
        queryClient.resetQueries({ queryKey: ["auth"] });
    };

    const refreshAuthData = () => {
        queryClient.refetchQueries({ queryKey: ["auth"] });
    };


    const getCachedAuthData = () => {
        return queryClient.getQueryData(["auth", "session"]);
    };

    const prefetchSession = () => {
        queryClient.prefetchQuery({
            queryKey: ["auth", "session"],
            queryFn: authApi.session,
            staleTime: 5 * 60 * 1000,
        });
    };

    return {
        loginMutation,
        sessionMutation,
        registerMutation,

        clearAuthCache,
        invalidateAuthCache,
        clearAllCache,
        invalidateAllQueries,
        resetAuthQueries,
        refreshAuthData,

        getCachedAuthData,
        prefetchSession,
    };
};