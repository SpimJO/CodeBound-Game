using System.Threading.Tasks;

public interface IAnalyticsService
{
    Task TrackEvent(string eventName, Dictionary<string, object> parameters = null);
    Task TrackLevelStart(int levelId);
    Task TrackLevelComplete(int levelId, float timeSpent);
}