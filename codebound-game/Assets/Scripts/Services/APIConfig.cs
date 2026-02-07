/// <summary>
/// API Configuration for backend connection.
/// Must match codebound-backend (no /v1 in URL; header is "api-key").
/// </summary>
public static class APIConfig
{
    // Base URL - no version in path. Change for production.
    public const string BASE_URL = "http://localhost:3000/api";

    // API Key - must match API_KEY in codebound-backend/.env (plain or encrypted)
    public const string API_KEY = "7003edba60fd212c1c89ea0d1aee6a638710ca78eeb20f8936e13c44150c2842";
    
    // Timeout settings
    public const int REQUEST_TIMEOUT_SECONDS = 30;
    public const int RETRY_MAX_ATTEMPTS = 3;
    
    // Endpoints
    public static class Endpoints
    {
        // Auth
        public const string AUTH_LOGIN = "/auth/login";
        public const string AUTH_REGISTER = "/auth/register";
        public const string AUTH_SESSION = "/auth/sessionToken";
        public const string AUTH_PROFILE = "/auth/profile";
        
        // Progress
        public const string PROGRESS_UPDATE = "/progress/update";
        public const string PROGRESS_GET = "/progress";
        
        // Skins
        public const string SKINS_AVAILABLE = "/skins/available";
        public const string SKINS_OWNED = "/skins";
        public const string SKINS_PURCHASE = "/skins/purchase";
        public const string SKINS_EQUIP = "/skins/equip";
        
        // Achievements
        public const string ACHIEVEMENTS_LIST = "/achievements";
        public const string ACHIEVEMENTS_UNLOCK = "/achievements/unlock";
        
        // Leaderboard
        public const string LEADERBOARD_GLOBAL = "/leaderboard";
        public const string LEADERBOARD_FRIENDS = "/leaderboard/friends";
        
        // Analytics
        public const string ANALYTICS_EVENT = "/analytics/event";
        
        // Game Session
        public const string SESSION_START = "/sessions/start";
        public const string SESSION_END = "/sessions/end";
    }
}