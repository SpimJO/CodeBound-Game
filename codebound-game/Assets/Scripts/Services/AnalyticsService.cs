using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Service for analytics tracking (FR11)
/// Handles download stats, platform stats, level stats, and engagement metrics
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private readonly IAPIService _apiService;
    private Dictionary<string, object> _cachedStats;
    private DateTime _lastCacheTime;
    private const float CACHE_DURATION = 300f; // Cache for 5 minutes

    public AnalyticsService(IAPIService apiService)
    {
        _apiService = apiService;
        _cachedStats = new Dictionary<string, object>();
        _lastCacheTime = DateTime.MinValue;
    }

    /// <summary>
    /// Track custom event with parameters (local logging + optional backend)
    /// </summary>
    public async Task TrackEvent(string eventName, Dictionary<string, object> parameters = null)
    {
        Debug.Log($"[Analytics] Event: {eventName}");
        if (parameters != null)
        {
            foreach (var param in parameters)
            {
                Debug.Log($"  {param.Key}: {param.Value}");
            }
        }
        
        // Future: Send to backend analytics endpoint if implemented
        await Task.CompletedTask;
    }

    /// <summary>
    /// Track level start
    /// </summary>
    public async Task TrackLevelStart(int levelId)
    {
        await TrackEvent("level_start", new Dictionary<string, object> 
        { 
            { "level_id", levelId },
            { "timestamp", DateTime.UtcNow.ToString("o") }
        });
    }

    /// <summary>
    /// Track level completion
    /// </summary>
    public async Task TrackLevelComplete(int levelId, float timeSpent)
    {
        await TrackEvent("level_complete", new Dictionary<string, object> 
        { 
            { "level_id", levelId }, 
            { "time_spent", timeSpent },
            { "timestamp", DateTime.UtcNow.ToString("o") }
        });
    }

    /// <summary>
    /// Get download count
    /// GET /analytics/downloads
    /// </summary>
    public async Task<DownloadStats> GetDownloadCount()
    {
        try
        {
            var response = await _apiService.Get<DownloadStats>("/analytics/downloads");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Download count: {response.Data.totalDownloads}");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch download count");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching download count: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Increment download count
    /// POST /analytics/downloads/increment
    /// </summary>
    public async Task<bool> IncrementDownloadCount(string platform)
    {
        try
        {
            var request = new IncrementDownloadRequest { platform = platform };
            var response = await _apiService.Post<DownloadStats>(
                "/analytics/downloads/increment",
                request
            );

            if (response.IsSuccess)
            {
                Debug.Log($"Download incremented for platform: {platform}");
                return true;
            }

            Debug.LogWarning("Failed to increment download count");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error incrementing download: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Get platform statistics
    /// GET /analytics/platform
    /// </summary>
    public async Task<PlatformStats> GetPlatformStats()
    {
        try
        {
            var response = await _apiService.Get<PlatformStats>("/analytics/platform");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log("Fetched platform stats");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch platform stats");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching platform stats: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Get level statistics
    /// GET /analytics/levels
    /// </summary>
    public async Task<LevelStats> GetLevelStats()
    {
        try
        {
            var response = await _apiService.Get<LevelStats>("/analytics/levels");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log("Fetched level stats");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch level stats");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching level stats: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Get engagement metrics
    /// GET /analytics/engagement
    /// </summary>
    public async Task<EngagementMetrics> GetEngagementMetrics()
    {
        try
        {
            var response = await _apiService.Get<EngagementMetrics>("/analytics/engagement");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log("Fetched engagement metrics");
                return response.Data;
            }

            Debug.LogWarning("Failed to fetch engagement metrics");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching engagement metrics: {ex.Message}");
            return null;
        }
    }
}

// Response Models
[Serializable]
public class DownloadStats
{
    public int totalDownloads;
    public string lastUpdated;
}

[Serializable]
public class IncrementDownloadRequest
{
    public string platform;
}

[Serializable]
public class PlatformStats
{
    public PlatformBreakdown windows;
    public PlatformBreakdown mac;
    public PlatformBreakdown linux;
    public PlatformBreakdown webgl;
}

[Serializable]
public class PlatformBreakdown
{
    public int count;
    public float percentage;
}

[Serializable]
public class LevelStats
{
    public int totalLevels;
    public int totalCompletions;
    public float averageCompletionTime;
    public List<LevelStat> levels;
}

[Serializable]
public class LevelStat
{
    public int levelNumber;
    public int completions;
    public float averageTime;
    public float averageHints;
}

[Serializable]
public class EngagementMetrics
{
    public int totalPlayers;
    public int activePlayers;
    public float averagePlaytime;
    public float averageSessionDuration;
}