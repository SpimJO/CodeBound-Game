import { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/error';

const prisma = new PrismaClient();

class CommunityService {
    /**
     * Create a new community post
     */
    async createPost(userId: string, content: string) {
        if (!content || content.trim().length === 0) {
            throw new HttpError(400, 'Post content cannot be empty');
        }

        if (content.length > 1000) {
            throw new HttpError(400, 'Post content too long (max 1000 characters)');
        }

        const post = await prisma.communityPost.create({
            data: {
                userId,
                content: content.trim(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        return post;
    }

    /**
     * Get community posts with pagination
     */
    async getPosts(limit = 20, offset = 0) {
        const validLimit = Math.min(Math.max(1, parseInt(limit.toString())), 50);
        const validOffset = Math.max(0, parseInt(offset.toString()));

        const [posts, total] = await Promise.all([
            prisma.communityPost.findMany({
                take: validLimit,
                skip: validOffset,
                orderBy: { created_at: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    comments: {
                        take: 3,
                        orderBy: { created_at: 'desc' },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                },
            }),
            prisma.communityPost.count(),
        ]);

        return {
            posts,
            pagination: {
                total,
                limit: validLimit,
                offset: validOffset,
                hasMore: validOffset + validLimit < total,
            },
        };
    }

    /**
     * Get a single post by ID
     */
    async getPostById(postId: string) {
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                comments: {
                    orderBy: { created_at: 'asc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        if (!post) {
            throw new HttpError(404, 'Post not found');
        }

        return post;
    }

    /**
     * Update a post (only by owner)
     */
    async updatePost(postId: string, userId: string, content: string) {
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new HttpError(404, 'Post not found');
        }

        if (post.userId !== userId) {
            throw new HttpError(403, 'You can only edit your own posts');
        }

        if (!content || content.trim().length === 0) {
            throw new HttpError(400, 'Post content cannot be empty');
        }

        const updatedPost = await prisma.communityPost.update({
            where: { id: postId },
            data: { content: content.trim() },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        return updatedPost;
    }

    /**
     * Delete a post (only by owner)
     */
    async deletePost(postId: string, userId: string) {
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new HttpError(404, 'Post not found');
        }

        if (post.userId !== userId) {
            throw new HttpError(403, 'You can only delete your own posts');
        }

        await prisma.communityPost.delete({
            where: { id: postId },
        });

        return { message: 'Post deleted successfully' };
    }

    /**
     * Like a post
     */
    async likePost(postId: string) {
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new HttpError(404, 'Post not found');
        }

        const updatedPost = await prisma.communityPost.update({
            where: { id: postId },
            data: { likes: post.likes + 1 },
        });

        return updatedPost;
    }

    /**
     * Add a comment to a post
     */
    async addComment(postId: string, userId: string, content: string) {
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new HttpError(404, 'Post not found');
        }

        if (!content || content.trim().length === 0) {
            throw new HttpError(400, 'Comment content cannot be empty');
        }

        if (content.length > 500) {
            throw new HttpError(400, 'Comment too long (max 500 characters)');
        }

        const comment = await prisma.communityComment.create({
            data: {
                postId,
                userId,
                content: content.trim(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        return comment;
    }

    /**
     * Delete a comment (only by owner)
     */
    async deleteComment(commentId: string, userId: string) {
        const comment = await prisma.communityComment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new HttpError(404, 'Comment not found');
        }

        if (comment.userId !== userId) {
            throw new HttpError(403, 'You can only delete your own comments');
        }

        await prisma.communityComment.delete({
            where: { id: commentId },
        });

        return { message: 'Comment deleted successfully' };
    }

    /**
     * Get user's posts
     */
    async getUserPosts(userId: string, limit = 10) {
        const posts = await prisma.communityPost.findMany({
            where: { userId },
            take: limit,
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        return posts;
    }
}

export default new CommunityService();
