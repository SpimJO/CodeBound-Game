using System.Collections.Generic;
using System.Threading.Tasks;

/// <summary>
/// Interface for game session service operations
/// </summary>
public interface IGameSessionService
{
    Task<GameSession> StartSession();
    Task<GameSession> EndSession();
    Task<List<GameSession>> GetUserSessions(int limit = 10);
    Task<GameSession> GetActiveSession();
    Task<SessionStats> GetSessionStats();
    void TrackLevelCompleted(int tokensEarned);
    bool IsSessionActive();
    string GetCurrentSessionId();
    float GetSessionDuration();
}
