import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCommunityPosts, 
  createCommunityPost, 
  likePost,
  getPostComments,
  addComment
} from "../api/community.api";

export const useCommunityPosts = (limit = 10, offset = 0) => {
  return useQuery({
    queryKey: ["community-posts", limit, offset],
    queryFn: () => getCommunityPosts(limit, offset),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createCommunityPost(content),
    onSuccess: () => {
      // Invalidate and refetch community posts
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => getPostComments(postId),
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      addComment(postId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};
