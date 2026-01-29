import "../utils/env"
import validateEnv from "../utils/env";

// Validate environment variables before creating config
validateEnv();

interface AppConfig {
    PORT: string;
    VERSION: string;
    BASEROUTE: string;
    DATABASE_URL: string;
    ENC_KEY_SECRET: string;
    CIPHER_KEY_SECRET: string;
    API_KEY_SECRET: string;
    API_KEY: string;
    NODE_ENV?: string;
    WHITELIST: string[];
}

const appConfig: AppConfig = {
    PORT: process.env.PORT!,
    VERSION: process.env.VERSION!,
    BASEROUTE: process.env.BASEROUTE!,
    DATABASE_URL: process.env.DATABASE_URL!,
    ENC_KEY_SECRET: process.env.ENC_KEY_SECRET!,
    CIPHER_KEY_SECRET: process.env.CIPHER_KEY_SECRET!,
    API_KEY_SECRET: process.env.API_KEY_SECRET!,
    API_KEY: process.env.API_KEY!,
    NODE_ENV: process.env.NODE_ENV,
    WHITELIST: process.env.WHITELIST
        ? process.env.WHITELIST.split(",").map((s) => s.trim())
        : []
}

export default appConfig
