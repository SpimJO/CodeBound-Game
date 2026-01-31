/// <summary>
/// API Configuration for backend connection
/// </summary>
public static class APIConfig
{
    // Base URL - Change this for production deployment
    public const string BASE_URL = "http://localhost:3000/api/v1";
    
    // API Key - Required by backend for all requests
    // NOTE: In production, load this from a secure source (not hardcoded)
    // This key must match the API_KEY in codebound-backend/.env
    public const string API_KEY = "00c41069a2c64a8b45e5a24712f7ccc5e87b496359e52898145d661b2cbf8336";
    
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
        public const string SESSION_START = "/session/start";
        public const string SESSION_END = "/session/end";
    }
}