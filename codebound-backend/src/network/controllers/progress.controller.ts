import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import { HttpError } from '../../lib/error';
import progressService from '../../services/progress.service';

class ProgressController extends Api {
    private httpError = new HttpError();
    /**
     * Update player progress after level completion
     * POST /api/progress/update
     */
    async updateProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { levelCompleted, tokensEarned, timeSpent, hintsUsed, isPerfect } = req.body;

            if (!levelCompleted || tokensEarned === undefined || timeSpent === undefined) {
                return next(this.httpError.badRequest('Missing required fields: levelCompleted, tokensEarned, timeSpent'));
            }

            const result = await progressService.updateProgress(userId, {
                levelCompleted,
                tokensEarned,
                timeSpent,
                hintsUsed: hintsUsed || 0,
                isPerfect: isPerfect || false,
            });

            return this.success(res, result, 'Progress updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get player progress
     * GET /api/progress
     */
    async getProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const progress = await progressService.getProgress(userId);
            return this.success(res, progress, 'Progress retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get level completions
     * GET /api/progress/levels
     */
    async getLevelCompletions(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const completions = await progressService.getLevelCompletions(userId, limit);

            return this.success(res, completions, 'Level completions retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get player statistics
     * GET /api/progress/stats
     */
    async getPlayerStats(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const stats = await progressService.getPlayerStats(userId);
            return this.success(res, stats, 'Player statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset player progress (admin only)
     * POST /api/progress/reset
     */
    async resetProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const result = await progressService.resetProgress(userId);
            return this.success(res, result, 'Progress reset successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new ProgressController();
