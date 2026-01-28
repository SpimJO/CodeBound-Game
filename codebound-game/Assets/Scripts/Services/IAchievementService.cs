using System.Threading.Tasks;

public interface IAchievementService
{
    Task UnlockAchievement(string achievementId);
    Task<List<Achievement>> GetAchievements();
    Task<bool> IsAchievementUnlocked(string achievementId);
}