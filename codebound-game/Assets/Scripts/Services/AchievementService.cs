using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using System;

[Serializable]
public class UnlockRequest
{
    public string achievementId;
}

[Serializable]
public class AchievementsResponse
{
    public List<Achievement> achievements;
}

public class AchievementService : IAchievementService
{
    private readonly IAPIService _apiService;
    private readonly IStorageService _storageService;
    private List<Achievement> _achievements;

    public AchievementService(IAPIService apiService)
    {
        _apiService = apiService;
        
        // Null check for GameManager and StorageService
        if (GameManager.Instance != null && GameManager.Instance.StorageService != null)
        {
            _storageService = GameManager.Instance.StorageService;
        }
        else
        {
            Debug.LogError("AchievementService: GameManager or StorageService not initialized");
        }
        
        _achievements = new List<Achievement>();
        _ = LoadAchievements(); // Fire and forget, but properly awaitable
    }

    public async Task UnlockAchievement(string achievementId)
    {
        if (string.IsNullOrEmpty(achievementId))
        {
            Debug.LogWarning("AchievementService: Cannot unlock achievement with null or empty ID");
            return;
        }

        if (_achievements == null)
        {
            Debug.LogWarning("AchievementService: Achievements list not initialized");
            return;
        }

        var achievement = _achievements.Find(a => a != null && a.id == achievementId);
        if (achievement != null && !achievement.isUnlocked)
        {
            achievement.isUnlocked = true;
            
            if (_storageService != null)
            {
                try
                {
                    await _storageService.SaveData($"achievement_{achievementId}", true);
                }
                catch (Exception ex)
                {
                    Debug.LogError($"AchievementService: Failed to save achievement unlock: {ex.Message}");
                }
            }
            
            // Note: Backend auto-unlocks achievements based on progress
            // No manual unlock endpoint needed
        }
    }

    public async Task<List<Achievement>> GetAchievements()
    {
        return _achievements;
    }

    public async Task<bool> IsAchievementUnlocked(string achievementId)
    {
        return await _storageService.HasKey($"achievement_{achievementId}");
    }

    private async Task LoadAchievements()
    {
        try
        {
            // Try to load from server - use /all endpoint for public list
            var response = await _apiService.Get<List<Achievement>>("/achievements/all");
            
            if (response != null && response.IsSuccess && response.Data != null)
            {
                _achievements = response.Data;
                // Validate unlocks with local storage
                foreach (var ach in _achievements)
                {
                    if (ach != null && !string.IsNullOrEmpty(ach.id))
                    {
                        if (await IsAchievementUnlocked(ach.id))
                        {
                            ach.isUnlocked = true;
                        }
                    }
                }
            }
            else
            {
                Debug.LogWarning("Failed to fetch achievements, using defaults.");
                InitializeDefaultAchievements();
            }
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading achievements: {ex.Message}");
            InitializeDefaultAchievements();
        }
    }

    private void InitializeDefaultAchievements()
    {
        // Fallback defaults
        _achievements = new List<Achievement>
        {
            new Achievement { id = "first_level", name = "First Steps", description = "Complete the first level" },
            // Add more achievements
        };
    }
}