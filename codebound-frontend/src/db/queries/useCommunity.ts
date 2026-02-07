import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/community.api';
import type { CreatePostRequest, AddCommentRequest, UpdatePostRequest } from '@/types/api.types';
import { HttpError, getErrorMessage } from '@/types/error.types';
import { toast } from 'sonner';

// Query keys
export const communityKeys = {
    all: ['community'] as const,
    posts: (limit?: number, offset?: number) => 
        [...communityKeys.all, 'posts', limit, offset] as const,
    post: (postId: string) => [...communityKeys.all, 'post', postId] as const,
    myPosts: (limit?: number) => [...communityKeys.all, 'myPosts', limit] as const,
};

// Get community posts
export const useCommunityPosts = (limit: number = 20, offset: number = 0) => {
    return useQuery({
        queryKey: communityKeys.posts(limit, offset),
        queryFn: async () => {
            const response = await communityApi.getPosts(limit, offset);
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
};

// Get single post
export const useCommunityPost = (postId: string) => {
    return useQuery({
        queryKey: communityKeys.post(postId),
        queryFn: async () => {
            const response = await communityApi.getPostById(postId);
            return response.data;
        },
        enabled: !!postId,
    });
};

// Get user posts
export const useMyPosts = (limit: number = 10) => {
    return useQuery({
        queryKey: communityKeys.myPosts(limit),
        queryFn: async () => {
            const response = await communityApi.getUserPosts(limit);
            return response.data;
        },
    });
};

// Create post mutation
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostRequest) => communityApi.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.all });
            toast.success('Post created successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to create post');
        },
    });
};

// Update post mutation
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: UpdatePostRequest }) =>
            communityApi.updatePost(postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.all });
            toast.success('Post updated successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to update post');
        },
    });
};

// Delete post mutation
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => communityApi.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.all });
            toast.success('Post deleted successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to delete post');
        },
    });
};

// Like post mutation
export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => communityApi.likePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.all });
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to like post');
        },
    });
};

// Add comment mutation
export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: AddCommentRequest }) =>
            communityApi.addComment(postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.all });
            toast.success('Comment added successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to add comment');
        },
    });
};

// Delete comment mutation
export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => communityApi.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: communityKeys.all });
            toast.success('Comment deleted successfully!');
        },
        onError: (error: HttpError) => {
            toast.error(getErrorMessage(error) || 'Failed to delete comment');
        },
    });
};
