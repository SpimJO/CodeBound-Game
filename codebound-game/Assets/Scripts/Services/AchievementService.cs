using System.Collections.Generic;
using System.Threading.Tasks;

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
        var achievement = _achievements.Find(a => a.Id == achievementId);
        if (achievement != null && !achievement.IsUnlocked)
        {
            achievement.IsUnlocked = true;
            await _storageService.SaveData($"achievement_{achievementId}", true);
            // Sync with server
            await _apiService.Post<object>("/achievements/unlock", new { achievementId });
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
        // Load from server or local
        _achievements = new List<Achievement>
        {
            new Achievement { Id = "first_level", Name = "First Steps", Description = "Complete the first level" },
            // Add more achievements
        };
    }
}