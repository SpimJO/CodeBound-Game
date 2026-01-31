import { Request, Response, NextFunction } from 'express';
import achievementService from '../../services/achievement.service';

class AchievementController {
    /**
     * Get user achievements
     * GET /api/achievements
     */
    async getUserAchievements(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const achievements = await achievementService.getUserAchievements(userId);

            res.status(200).json({
                success: true,
                data: achievements,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get achievement progress
     * GET /api/achievements/progress
     */
    async getAchievementProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const progress = await achievementService.getAchievementProgress(userId);

            res.status(200).json({
                success: true,
                data: progress,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all available achievements
     * GET /api/achievements/all
     */
    async getAllAchievements(req: Request, res: Response, next: NextFunction) {
        try {
            const achievements = await achievementService.getAllAchievements();

            res.status(200).json({
                success: true,
                data: achievements,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AchievementController();
