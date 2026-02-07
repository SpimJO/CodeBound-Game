import Cookies from "js-cookie";

/**
 * Get authentication token from cookies
 * This is a utility function (not a hook) that can be called anywhere
 */
export const getAuthToken = (): string | undefined => {
    const tokenName = import.meta.env.VITE_TOKEN_NAME || "session-token";
    return Cookies.get(tokenName);
};

/**
 * Set authentication token in cookies
 */
export const setAuthToken = (token: string): void => {
    Cookies.set("session-token", token, { expires: 30 });
};

/**
 * Remove authentication token from cookies
 */
export const removeAuthToken = (): void => {
    Cookies.remove("session-token");
};
