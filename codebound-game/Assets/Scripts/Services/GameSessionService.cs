using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Service for game session tracking (FR10)
/// Handles starting/ending sessions and session statistics
/// </summary>
public class GameSessionService : IGameSessionService
{
    private readonly IAPIService _apiService;
    private readonly IStorageService _storageService;
    private string _currentSessionId;
    private DateTime _sessionStartTime;
    private int _levelsPlayedThisSession;
    private int _tokensEarnedThisSession;

    public GameSessionService(IAPIService apiService, IStorageService storageService)
    {
        _apiService = apiService;
        _storageService = storageService;
        _currentSessionId = null;
        _levelsPlayedThisSession = 0;
        _tokensEarnedThisSession = 0;
    }

    /// <summary>
    /// Start a new game session
    /// POST /sessions/start
    /// </summary>
    public async Task<GameSession> StartSession()
    {
        try
        {
            // End any existing session first
            if (_currentSessionId != null)
            {
                Debug.LogWarning("Session already active, ending previous session");
                await EndSession();
            }

            var response = await _apiService.Post<GameSession>("/sessions/start", null);

            if (response.IsSuccess && response.Data != null)
            {
                _currentSessionId = response.Data.id;
                _sessionStartTime = DateTime.Now;
                _levelsPlayedThisSession = 0;
                _tokensEarnedThisSession = 0;

                await _storageService.SaveData("current_session_id", _currentSessionId);
                
                Debug.Log($"Game session started: {_currentSessionId}");
                return response.Data;
            }

            Debug.LogError("Failed to start game session");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error starting session: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// End current game session
    /// POST /sessions/:sessionId/end
    /// </summary>
    public async Task<GameSession> EndSession()
    {
        try
        {
            if (string.IsNullOrEmpty(_currentSessionId))
            {
                Debug.LogWarning("No active session to end");
                return null;
            }

            var endSessionRequest = new EndSessionRequest
            {
                levelsPlayed = _levelsPlayedThisSession,
                tokensEarned = _tokensEarnedThisSession
            };

            var response = await _apiService.Post<GameSession>(
                $"/sessions/{_currentSessionId}/end",
                endSessionRequest
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Session ended. Levels: {_levelsPlayedThisSession}, Tokens: {_tokensEarnedThisSession}");
                
                // Clear session data
                _currentSessionId = null;
                _levelsPlayedThisSession = 0;
                _tokensEarnedThisSession = 0;
                await _storageService.DeleteData("current_session_id");

                return response.Data;
            }

            Debug.LogError("Failed to end game session");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error ending session: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Get all user sessions
    /// GET /sessions
    /// </summary>
    public async Task<List<GameSession>> GetUserSessions(int limit = 10)
    {
        try
        {
            var response = await _apiService.Get<List<GameSession>>(
                $"/sessions?limit={limit}"
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Fetched {response.Data.Count} sessions");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch user sessions");
            return new List<GameSession>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching sessions: {ex.Message}");
            return new List<GameSession>();
        }
    }

    /// <summary>
    /// Get active session
    /// GET /sessions/active
    /// </summary>
    public async Task<GameSession> GetActiveSession()
    {
        try
        {
            var response = await _apiService.Get<GameSession>("/sessions/active");

            if (response.IsSuccess && response.Data != null)
            {
                _currentSessionId = response.Data.id;
                Debug.Log($"Active session found: {_currentSessionId}");
                return response.Data;
            }

            Debug.Log("No active session");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching active session: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Get session statistics
    /// GET /sessions/stats
    /// </summary>
    public async Task<SessionStats> GetSessionStats()
    {
        try
        {
            var response = await _apiService.Get<SessionStats>("/sessions/stats");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log("Fetched session stats");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch session stats");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching session stats: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Track level completion in current session
    /// </summary>
    public void TrackLevelCompleted(int tokensEarned)
    {
        _levelsPlayedThisSession++;
        _tokensEarnedThisSession += tokensEarned;
        Debug.Log($"Session progress: {_levelsPlayedThisSession} levels, {_tokensEarnedThisSession} tokens");
    }

    /// <summary>
    /// Check if session is active
    /// </summary>
    public bool IsSessionActive()
    {
        return !string.IsNullOrEmpty(_currentSessionId);
    }

    /// <summary>
    /// Get current session ID
    /// </summary>
    public string GetCurrentSessionId()
    {
        return _currentSessionId;
    }

    /// <summary>
    /// Get session duration in seconds
    /// </summary>
    public float GetSessionDuration()
    {
        if (_currentSessionId == null) return 0f;
        return (float)(DateTime.Now - _sessionStartTime).TotalSeconds;
    }
}

// Request/Response Models
[Serializable]
public class EndSessionRequest
{
    public int levelsPlayed;
    public int tokensEarned;
}

[Serializable]
public class GameSession
{
    public string id;
    public string userId;
    public string startedAt;
    public string endedAt;
    public float duration;
    public int levelsPlayed;
    public int tokensEarned;
}

[Serializable]
public class SessionStats
{
    public int totalSessions;
    public float totalPlayTime;
    public int totalLevelsPlayed;
    public int totalTokensEarned;
    public float averageSessionDuration;
    public float averageLevelsPerSession;
    public float averageTokensPerSession;
}
