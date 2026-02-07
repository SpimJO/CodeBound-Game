using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Service for community features (FR12)
/// Handles posts, comments, and likes
/// </summary>
public class CommunityService : ICommunityService
{
    private readonly IAPIService _apiService;
    private List<CommunityPost> _cachedPosts;
    private DateTime _lastCacheTime;
    private const float CACHE_DURATION = 30f; // Cache for 30 seconds

    public CommunityService(IAPIService apiService)
    {
        _apiService = apiService;
        _cachedPosts = new List<CommunityPost>();
        _lastCacheTime = DateTime.MinValue;
    }

    /// <summary>
    /// Get all community posts
    /// GET /community/posts
    /// </summary>
    public async Task<List<CommunityPost>> GetPosts(int limit = 20, int offset = 0)
    {
        try
        {
            // Check cache
            if (_cachedPosts.Count > 0 && (DateTime.Now - _lastCacheTime).TotalSeconds < CACHE_DURATION)
            {
                Debug.Log("Returning cached posts");
                return _cachedPosts;
            }

            var response = await _apiService.Get<PostsResponse>(
                $"/community/posts?limit={limit}&offset={offset}"
            );

            if (response.IsSuccess && response.Data != null)
            {
                _cachedPosts = response.Data.posts;
                _lastCacheTime = DateTime.Now;
                Debug.Log($"Fetched {response.Data.posts.Count} posts");
                return response.Data.posts;
            }

            Debug.LogWarning("Failed to fetch posts");
            return new List<CommunityPost>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching posts: {ex.Message}");
            return new List<CommunityPost>();
        }
    }

    /// <summary>
    /// Get single post by ID
    /// GET /community/posts/:postId
    /// </summary>
    public async Task<CommunityPost> GetPostById(string postId)
    {
        try
        {
            var response = await _apiService.Get<CommunityPost>($"/community/posts/{postId}");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Fetched post: {postId}");
                return response.Data;
            }

            Debug.LogWarning($"Failed to fetch post: {postId}");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching post: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Create new post
    /// POST /community/posts
    /// </summary>
    public async Task<CommunityPost> CreatePost(string content, string postType = "achievement")
    {
        try
        {
            var request = new CreatePostRequest
            {
                content = content,
                postType = postType
            };

            var response = await _apiService.Post<CommunityPost>("/community/posts", request);

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log("Post created successfully");
                ClearCache();
                return response.Data;
            }

            Debug.LogWarning("Failed to create post");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error creating post: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Update post
    /// PUT /community/posts/:postId
    /// </summary>
    public async Task<CommunityPost> UpdatePost(string postId, string content)
    {
        try
        {
            var request = new UpdatePostRequest { content = content };
            var response = await _apiService.Put<CommunityPost>(
                $"/community/posts/{postId}",
                request
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Post updated: {postId}");
                ClearCache();
                return response.Data;
            }

            Debug.LogWarning($"Failed to update post: {postId}");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error updating post: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Delete post
    /// DELETE /community/posts/:postId
    /// </summary>
    public async Task<bool> DeletePost(string postId)
    {
        try
        {
            var response = await _apiService.Delete<object>($"/community/posts/{postId}");

            if (response.IsSuccess)
            {
                Debug.Log($"Post deleted: {postId}");
                ClearCache();
                return true;
            }

            Debug.LogWarning($"Failed to delete post: {postId}");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error deleting post: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Like a post
    /// POST /community/posts/:postId/like
    /// </summary>
    public async Task<bool> LikePost(string postId)
    {
        try
        {
            var response = await _apiService.Post<object>(
                $"/community/posts/{postId}/like",
                null
            );

            if (response.IsSuccess)
            {
                Debug.Log($"Post liked: {postId}");
                ClearCache();
                return true;
            }

            Debug.LogWarning($"Failed to like post: {postId}");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error liking post: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Add comment to post
    /// POST /community/posts/:postId/comments
    /// </summary>
    public async Task<CommunityComment> AddComment(string postId, string content)
    {
        try
        {
            var request = new AddCommentRequest { content = content };
            var response = await _apiService.Post<CommunityComment>(
                $"/community/posts/{postId}/comments",
                request
            );

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Comment added to post: {postId}");
                ClearCache();
                return response.Data;
            }

            Debug.LogWarning($"Failed to add comment to post: {postId}");
            return null;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error adding comment: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Delete comment
    /// DELETE /community/comments/:commentId
    /// </summary>
    public async Task<bool> DeleteComment(string commentId)
    {
        try
        {
            var response = await _apiService.Delete<object>($"/community/comments/{commentId}");

            if (response.IsSuccess)
            {
                Debug.Log($"Comment deleted: {commentId}");
                ClearCache();
                return true;
            }

            Debug.LogWarning($"Failed to delete comment: {commentId}");
            return false;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error deleting comment: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Get user's own posts
    /// GET /community/my-posts
    /// </summary>
    public async Task<List<CommunityPost>> GetMyPosts()
    {
        try
        {
            var response = await _apiService.Get<PostsResponse>("/community/my-posts");

            if (response.IsSuccess && response.Data != null)
            {
                Debug.Log($"Fetched {response.Data.posts.Count} user posts");
                return response.Data.posts;
            }

            Debug.LogWarning("Failed to fetch user posts");
            return new List<CommunityPost>();
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error fetching user posts: {ex.Message}");
            return new List<CommunityPost>();
        }
    }

    /// <summary>
    /// Clear cached posts
    /// </summary>
    public void ClearCache()
    {
        _cachedPosts.Clear();
        _lastCacheTime = DateTime.MinValue;
        Debug.Log("Community cache cleared");
    }
}

// Request Models
[Serializable]
public class CreatePostRequest
{
    public string content;
    public string postType;
}

[Serializable]
public class UpdatePostRequest
{
    public string content;
}

[Serializable]
public class AddCommentRequest
{
    public string content;
}

// Response Models
[Serializable]
public class PostsResponse
{
    public List<CommunityPost> posts;
    public int total;
    public int limit;
    public int offset;
}

[Serializable]
public class CommunityPost
{
    public string id;
    public string userId;
    public string username;
    public string avatar;
    public string content;
    public string postType;
    public int likesCount;
    public int commentsCount;
    public string createdAt;
    public string updatedAt;
    public List<CommunityComment> comments;
    public bool isLiked;
}

[Serializable]
public class CommunityComment
{
    public string id;
    public string postId;
    public string userId;
    public string username;
    public string avatar;
    public string content;
    public string createdAt;
}
