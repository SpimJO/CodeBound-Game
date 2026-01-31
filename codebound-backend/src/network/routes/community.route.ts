import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import communityController from '../controllers/community.controller';

const community: Router = Router();

// All routes require API key
community.use(apiKeyMiddleware);

// Get community posts (public)
community
    .route('/posts')
    .get((req: Request, res: Response, next: NextFunction) =>
        communityController.getPosts(req, res, next)
    )
    // Create post (requires auth)
    .post(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        communityController.createPost(req, res, next)
    );

// Get single post (public)
community
    .route('/posts/:postId')
    .get((req: Request, res: Response, next: NextFunction) =>
        communityController.getPostById(req, res, next)
    )
    // Update post (requires auth)
    .put(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        communityController.updatePost(req, res, next)
    )
    // Delete post (requires auth)
    .delete(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        communityController.deletePost(req, res, next)
    );

// Like a post (public - anyone can like)
community
    .route('/posts/:postId/like')
    .post((req: Request, res: Response, next: NextFunction) =>
        communityController.likePost(req, res, next)
    );

// Add comment (requires auth)
community
    .route('/posts/:postId/comments')
    .post(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        communityController.addComment(req, res, next)
    );

// Delete comment (requires auth)
community
    .route('/comments/:commentId')
    .delete(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        communityController.deleteComment(req, res, next)
    );

// Get user's posts (requires auth)
community
    .route('/my-posts')
    .get(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        communityController.getUserPosts(req, res, next)
    );

export default community;
