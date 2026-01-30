import xior from "@/http/xior";

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  likes: number;
  commentCount: number;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  created_at: string;
}

export interface CommunityPostsResponse {
  posts: CommunityPost[];
  total: number;
}

export interface CreatePostRequest {
  content: string;
}

export interface CreateCommentRequest {
  content: string;
}

// Get community posts (public)
export const getCommunityPosts = async (limit = 10, offset = 0): Promise<CommunityPostsResponse> => {
  const { data } = await xior.get(`/api/v1/community/posts?limit=${limit}&offset=${offset}`);
  return data.data;
};

// Create post (auth required)
export const createCommunityPost = async (content: string): Promise<CommunityPost> => {
  const { data } = await xior.post(`/api/v1/community/posts`, { content });
  return data.data;
};

// Like post (auth required)
export const likePost = async (postId: string): Promise<{ likes: number }> => {
  const { data } = await xior.post(`/api/v1/community/posts/${postId}/like`);
  return data.data;
};

// Get post comments
export const getPostComments = async (postId: string): Promise<{ comments: CommunityComment[] }> => {
  const { data } = await xior.get(`/api/v1/community/posts/${postId}/comments`);
  return data.data;
};

// Add comment (auth required)
export const addComment = async (postId: string, content: string): Promise<CommunityComment> => {
  const { data } = await xior.post(`/api/v1/community/posts/${postId}/comments`, { content });
  return data.data;
};
