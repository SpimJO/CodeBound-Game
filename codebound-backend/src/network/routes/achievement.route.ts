import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import achievementController from '../controllers/achievement.controller';

const achievement: Router = Router();

// Public route for all achievements
achievement
    .route('/all')
    .get(apiKeyMiddleware, (req: Request, res: Response, next: NextFunction) =>
        achievementController.getAllAchievements(req, res, next)
    );

// Protected routes (require API key and auth)
achievement.use(apiKeyMiddleware, authMiddleware);

// Get user achievements
achievement
    .route('/')
    .get((req: Request, res: Response, next: NextFunction) =>
        achievementController.getUserAchievements(req, res, next)
    );

// Get achievement progress
achievement
    .route('/progress')
    .get((req: Request, res: Response, next: NextFunction) =>
        achievementController.getAchievementProgress(req, res, next)
    );

// Claim achievement reward
achievement
    .route('/claim')
    .post((req: Request, res: Response, next: NextFunction) =>
        achievementController.claimAchievement(req, res, next)
    );

export default achievement;
