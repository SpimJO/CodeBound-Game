interface ImportMetaEnv {
    readonly VITE_BACKEND_WS_BASE_URL: string;
    readonly VITE_BACKEND_BASE_URL: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;

    readonly PROD_SERVER_HOST: string;
    readonly PROD_SERVER_ALLOWED_HOST: string;

    readonly VITE_BRAND_NAME: string;

    readonly VITE_TOKEN_NAME: string;

    readonly VITE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}