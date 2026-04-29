import cors from "cors";
import appConfig from "@/config";

const isLocalhost = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, "");

const matchesOrigin = (allowedOrigin: string, requestOrigin: string) => {
    const normalizedAllowedOrigin = normalizeOrigin(allowedOrigin);
    const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

    if (normalizedAllowedOrigin === normalizedRequestOrigin) {
        return true;
    }

    if (!normalizedAllowedOrigin.includes("*")) {
        return false;
    }

    const escapedPattern = normalizedAllowedOrigin
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");

    return new RegExp(`^${escapedPattern}$`).test(normalizedRequestOrigin);
};

export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isLocalhost(origin)) return callback(null, true);
        if (appConfig.WHITELIST.some((allowedOrigin) => matchesOrigin(allowedOrigin, origin))) {
            return callback(null, true);
        }
        callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "api-key", "x-api-key"],
};