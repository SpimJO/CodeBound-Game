import { Request, Response, NextFunction } from 'express';
import Api from '../../lib/api';
import { HttpError } from '../../lib/error';
import progressService from '../../services/progress.service';

class ProgressController extends Api {
    private httpError = new HttpError();
    /**
     * Update player progress after level completion
     * POST /progress/update
     */
    async updateProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { levelCompleted, tokensEarned, timeSpent, hintsUsed, isPerfect, hasCodeErrors } = req.body;

            if (!levelCompleted || tokensEarned === undefined || timeSpent === undefined) {
                return next(this.httpError.badRequest('Missing required fields: levelCompleted, tokensEarned, timeSpent'));
            }

            if (!Number.isInteger(levelCompleted) || levelCompleted < 1) {
                return next(this.httpError.badRequest('levelCompleted must be an integer >= 1'));
            }

            if (Number(tokensEarned) < 0 || Number(timeSpent) < 0 || Number(hintsUsed || 0) < 0) {
                return next(this.httpError.badRequest('tokensEarned, timeSpent, and hintsUsed must be >= 0'));
            }

            if (Boolean(hasCodeErrors)) {
                return next(this.httpError.badRequest('Cannot complete level with code errors'));
            }

            const result = await progressService.updateProgress(userId, {
                levelCompleted: Number(levelCompleted),
                tokensEarned: Number(tokensEarned),
                timeSpent: Number(timeSpent),
                hintsUsed: Number(hintsUsed || 0),
                isPerfect: Boolean(isPerfect),
                hasCodeErrors: Boolean(hasCodeErrors),
            });

            return this.success(res, result, 'Progress updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get player progress
     * GET /progress
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
     * GET /progress/levels
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
     * GET /progress/stats
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
     * POST /progress/reset
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

    /**
     * Sync overworld coin tokens to the backend.
     * POST /progress/sync-tokens
     * Body: { tokensToAdd: number }
     */
    async syncTokens(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const tokensToAdd = Number(req.body.tokensToAdd ?? 0);
            if (isNaN(tokensToAdd) || !Number.isInteger(tokensToAdd) || tokensToAdd < 0) {
                return next(this.httpError.badRequest('tokensToAdd must be a non-negative integer'));
            }

            const result = await progressService.syncTokens(userId, tokensToAdd);
            return this.success(res, result, 'Tokens synced successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new ProgressController();
