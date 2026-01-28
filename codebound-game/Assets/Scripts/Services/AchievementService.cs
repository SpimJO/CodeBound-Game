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
        _storageService = GameManager.Instance.StorageService;
        _achievements = new List<Achievement>();
        LoadAchievements();
    }

    public async Task UnlockAchievement(string achievementId)
    {
        var achievement = _achievements.Find(a => a.id == achievementId);
        if (achievement != null && !achievement.isUnlocked)
        {
            achievement.isUnlocked = true;
            await _storageService.SaveData($"achievement_{achievementId}", true);
            // Sync with server
            await _apiService.Post<object>("/achievements/unlock", new UnlockRequest { achievementId = achievementId });
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

    private async void LoadAchievements()
    {
        // Try to load from server
        var response = await _apiService.Get<AchievementsResponse>("/achievements");
        
        if (response.IsSuccess && response.Data != null && response.Data.achievements != null)
        {
            _achievements = response.Data.achievements;
            // Validate unlocks with local storage
            foreach (var ach in _achievements)
            {
                if (await IsAchievementUnlocked(ach.id))
                {
                    ach.isUnlocked = true;
                }
            }
        }
        else
        {
            Debug.LogWarning("Failed to fetch achievements, using defaults.");
            // Fallback defaults
            _achievements = new List<Achievement>
            {
                new Achievement { id = "first_level", name = "First Steps", description = "Complete the first level" },
                // Add more achievements
            };
        }
    }
}