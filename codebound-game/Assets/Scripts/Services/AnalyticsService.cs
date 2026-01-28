using System.Collections.Generic;
using System.Threading.Tasks;

public class AnalyticsService : IAnalyticsService
{
    public async Task TrackEvent(string eventName, Dictionary<string, object> parameters = null)
    {
        // Implement analytics tracking, e.g., send to server or local logging
        Debug.Log($"Event: {eventName}");
        if (parameters != null)
        {
            foreach (var param in parameters)
            {
                Debug.Log($"{param.Key}: {param.Value}");
            }
        }
    }

    public async Task TrackLevelStart(int levelId)
    {
        await TrackEvent("level_start", new Dictionary<string, object> { { "level_id", levelId } });
    }

    public async Task TrackLevelComplete(int levelId, float timeSpent)
    {
        await TrackEvent("level_complete", new Dictionary<string, object> { { "level_id", levelId }, { "time_spent", timeSpent } });
    }
}