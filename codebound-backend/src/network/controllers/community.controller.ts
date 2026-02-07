import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import { HttpError } from '../../lib/error';
import communityService from '../../services/community.service';

class CommunityController extends Api {
    private httpError = new HttpError();

    /**
     * Create a new community post
     * POST /api/community/posts
     */
    async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { content } = req.body;
            if (!content) {
                return next(this.httpError.badRequest('Content is required'));
            }

            const post = await communityService.createPost(userId, content);
            return this.created(res, post, 'Post created successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get community posts
     * GET /api/community/posts
     */
    async getPosts(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await communityService.getPosts(limit, offset);
            return this.success(res, result, 'Posts retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single post
     * GET /api/community/posts/:postId
     */
    async getPostById(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const post = await communityService.getPostById(postId);
            return this.success(res, post, 'Post retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a post
     * PUT /api/community/posts/:postId
     */
    async updatePost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { postId } = req.params;
            const { content } = req.body;

            if (!content) {
                return next(this.httpError.badRequest('Content is required'));
            }

            const post = await communityService.updatePost(postId, userId, content);
            return this.success(res, post, 'Post updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a post
     * DELETE /api/community/posts/:postId
     */
    async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { postId } = req.params;
            const result = await communityService.deletePost(postId, userId);
            return this.success(res, result, 'Post deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Like a post
     * POST /api/community/posts/:postId/like
     */
    async likePost(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const post = await communityService.likePost(postId);
            return this.success(res, post, 'Post liked successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add a comment to a post
     * POST /api/community/posts/:postId/comments
     */
    async addComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { postId } = req.params;
            const { content } = req.body;

            if (!content) {
                return next(this.httpError.badRequest('Content is required'));
            }

            const comment = await communityService.addComment(postId, userId, content);
            return this.created(res, comment, 'Comment added successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a comment
     * DELETE /api/community/comments/:commentId
     */
    async deleteComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { commentId } = req.params;
            const result = await communityService.deleteComment(commentId, userId);
            return this.success(res, result, 'Comment deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's posts
     * GET /api/community/my-posts
     */
    async getUserPosts(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const posts = await communityService.getUserPosts(userId, limit);
            return this.success(res, posts, 'User posts retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new CommunityController();
