import api from "@/http/xior";
import type {
    ApiResponse,
    CommunityPost,
    CommunityPostsResponse,
    CreatePostRequest,
    UpdatePostRequest,
    AddCommentRequest,
    CommunityComment,
} from "@/types/api.types";

export const communityApi = {
    getPosts: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<CommunityPostsResponse>> => {
        const response = await api.get(`/community/posts?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    getPostById: async (postId: string): Promise<ApiResponse<CommunityPost>> => {
        const response = await api.get(`/community/posts/${postId}`);
        return response.data;
    },

    createPost: async (data: CreatePostRequest): Promise<ApiResponse<CommunityPost>> => {
        const response = await api.post("/community/posts", data);
        return response.data;
    },

    updatePost: async (postId: string, data: UpdatePostRequest): Promise<ApiResponse<CommunityPost>> => {
        const response = await api.put(`/community/posts/${postId}`, data);
        return response.data;
    },

    deletePost: async (postId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/community/posts/${postId}`);
        return response.data;
    },

    likePost: async (postId: string): Promise<ApiResponse<CommunityPost>> => {
        const response = await api.post(`/community/posts/${postId}/like`);
        return response.data;
    },

    addComment: async (postId: string, data: AddCommentRequest): Promise<ApiResponse<CommunityComment>> => {
        const response = await api.post(`/community/posts/${postId}/comments`, data);
        return response.data;
    },

    deleteComment: async (commentId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/community/comments/${commentId}`);
        return response.data;
    },

    getUserPosts: async (limit: number = 10): Promise<ApiResponse<CommunityPost[]>> => {
        const response = await api.get(`/community/my-posts?limit=${limit}`);
        return response.data;
    },
};
