using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Service for leaderboard operations (FR09)
/// Handles getting leaderboard data, player ranks, and top players
/// </summary>
public class LeaderboardService : ILeaderboardService
{
    private readonly IAPIService _apiService;
    private List<LeaderboardEntry> _cachedLeaderboard;
    private DateTime _lastCacheTime;
    private const float CACHE_DURATION = 60f; // Cache for 60 seconds

    public LeaderboardService(IAPIService apiService)
    {
        _apiService = apiService;
        _cachedLeaderboard = new List<LeaderboardEntry>();
        _lastCacheTime = DateTime.MinValue;
    }

    /// <summary>
    /// Get full leaderboard
    /// GET /leaderboard
    /// </summary>
    public async Task<List<LeaderboardEntry>> GetLeaderboard(int limit = 50, int offset = 0)
    {
        try
        {
            // Check cache
            if (_cachedLeaderboard.Count > 0 && (DateTime.Now - _lastCacheTime).TotalSeconds < CACHE_DURATION)
            {
                Debug.Log("Returning cached leaderboard");
                return _cachedLeaderboard;
            }

            var response = await _apiService.Get<List<LeaderboardEntry>>(
                $"/leaderboard?limit={limit}&offset={offset}"
            );

            if (response.IsSuccess && response.Data != null)
            {
                _cachedLeaderboard = response.Data;
                _lastCacheTime = DateTime.Now;
                Debug.Log($"Fetched {response.Data.Count} leaderboard entries");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch leaderboard");
            return new List<LeaderboardEntry>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching leaderboard: {ex.Message}");
            return new List<LeaderboardEntry>();
        }
    }

    /// <summary>
    /// Get top N players
    /// GET /leaderboard/top/:count
    /// </summary>
    public async Task<List<LeaderboardEntry>> GetTopPlayers(int count = 10)
    {
        try
        {
            var response = await _apiService.Get<List<LeaderboardEntry>>(
                $"/leaderboard/top/{count}"
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Fetched top {count} players");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch top players");
            return new List<LeaderboardEntry>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching top players: {ex.Message}");
            return new List<LeaderboardEntry>();
        }
    }

    /// <summary>
    /// Get player's rank
    /// GET /leaderboard/rank
    /// </summary>
    public async Task<PlayerRankInfo> GetPlayerRank()
    {
        try
        {
            var response = await _apiService.Get<PlayerRankInfo>("/leaderboard/rank");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Player rank: {response.Data.rank}");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch player rank");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching player rank: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Get leaderboard around player (context view)
    /// GET /leaderboard/around-me
    /// </summary>
    public async Task<LeaderboardAroundPlayer> GetLeaderboardAroundPlayer(int range = 5)
    {
        try
        {
            var response = await _apiService.Get<LeaderboardAroundPlayer>(
                $"/leaderboard/around-me?range={range}"
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Fetched leaderboard around player (range: {range})");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch leaderboard around player");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching leaderboard around player: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Get leaderboard statistics
    /// GET /leaderboard/stats
    /// </summary>
    public async Task<LeaderboardStats> GetLeaderboardStats()
    {
        try
        {
            var response = await _apiService.Get<LeaderboardStats>("/leaderboard/stats");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log("Fetched leaderboard stats");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch leaderboard stats");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching leaderboard stats: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Clear cached leaderboard data
    /// </summary>
    public void ClearCache()
    {
        _cachedLeaderboard.Clear();
        _lastCacheTime = DateTime.MinValue;
        Debug.Log("Leaderboard cache cleared");
    }
}

// Response Models
[Serializable]
public class LeaderboardEntry
{
    public int rank;
    public string userId;
    public string username;
    public int totalTokens;
    public int currentLevel;
    public int highestLevel;
    public float totalPlayTime;
    public string avatar;
}

[Serializable]
public class PlayerRankInfo
{
    public int rank;
    public int totalPlayers;
    public int totalTokens;
    public string percentile;
}

[Serializable]
public class LeaderboardAroundPlayer
{
    public List<LeaderboardEntry> above;
    public LeaderboardEntry player;
    public List<LeaderboardEntry> below;
}

[Serializable]
public class LeaderboardStats
{
    public int totalPlayers;
    public int averageLevel;
    public int averageTokens;
    public int highestLevel;
    public int highestTokens;
}
