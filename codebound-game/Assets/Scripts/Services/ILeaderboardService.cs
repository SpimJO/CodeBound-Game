using System.Collections.Generic;
using System.Threading.Tasks;

/// <summary>
/// Interface for leaderboard service operations
/// </summary>
public interface ILeaderboardService
{
    Task<List<LeaderboardEntry>> GetLeaderboard(int limit = 50, int offset = 0);
    Task<List<LeaderboardEntry>> GetTopPlayers(int count = 10);
    Task<PlayerRankInfo> GetPlayerRank();
    Task<LeaderboardAroundPlayer> GetLeaderboardAroundPlayer(int range = 5);
    Task<LeaderboardStats> GetLeaderboardStats();
    void ClearCache();
}
