import { Request, Response, NextFunction } from 'express';
import Api from '../../lib/api';
import { HttpError } from '../../lib/error';
import achievementService from '../../services/achievement.service';

class AchievementController extends Api {
    private httpError = new HttpError();
    /**
     * Get user achievements
     * GET /achievements
     */
    async getUserAchievements(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const achievements = await achievementService.getUserAchievements(userId);
            return this.success(res, achievements, 'User achievements retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get achievement progress
     * GET /achievements/progress
     */
    async getAchievementProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const progress = await achievementService.getAchievementProgress(userId);
            return this.success(res, progress, 'Achievement progress retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all available achievements
     * GET /achievements/all
     */
    async getAllAchievements(req: Request, res: Response, next: NextFunction) {
        try {
            const achievements = await achievementService.getAllAchievements();
            return this.success(res, achievements, 'All achievements retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new AchievementController();
