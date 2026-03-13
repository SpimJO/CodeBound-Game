import cors from "cors";
import appConfig from "@/config";

const isLocalhost = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (appConfig.WHITELIST.includes(origin)) return callback(null, true);
        if (appConfig.NODE_ENV !== "production" && isLocalhost(origin)) return callback(null, true);
        callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "api-key", "x-api-key"],
};