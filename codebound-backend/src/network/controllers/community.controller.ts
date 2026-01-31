import { Request, Response, NextFunction } from 'express';
import communityService from '../../services/community.service';

class CommunityController {
    /**
     * Create a new community post
     * POST /api/community/posts
     */
    async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { content } = req.body;
            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const post = await communityService.createPost(userId, content);

            res.status(201).json({
                success: true,
                data: post,
            });
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

            res.status(200).json({
                success: true,
                data: result,
            });
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

            res.status(200).json({
                success: true,
                data: post,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.params;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const post = await communityService.updatePost(postId, userId, content);

            res.status(200).json({
                success: true,
                data: post,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.params;
            const result = await communityService.deletePost(postId, userId);

            res.status(200).json({
                success: true,
                data: result,
            });
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

            res.status(200).json({
                success: true,
                data: post,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.params;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const comment = await communityService.addComment(postId, userId, content);

            res.status(201).json({
                success: true,
                data: comment,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { commentId } = req.params;
            const result = await communityService.deleteComment(commentId, userId);

            res.status(200).json({
                success: true,
                data: result,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const posts = await communityService.getUserPosts(userId, limit);

            res.status(200).json({
                success: true,
                data: posts,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new CommunityController();
