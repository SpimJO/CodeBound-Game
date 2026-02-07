using System.Collections.Generic;
using System.Threading.Tasks;

/// <summary>
/// Interface for community service operations
/// </summary>
public interface ICommunityService
{
    Task<List<CommunityPost>> GetPosts(int limit = 20, int offset = 0);
    Task<CommunityPost> GetPostById(string postId);
    Task<CommunityPost> CreatePost(string content, string postType = "achievement");
    Task<CommunityPost> UpdatePost(string postId, string content);
    Task<bool> DeletePost(string postId);
    Task<bool> LikePost(string postId);
    Task<CommunityComment> AddComment(string postId, string content);
    Task<bool> DeleteComment(string commentId);
    Task<List<CommunityPost>> GetMyPosts();
    void ClearCache();
}
