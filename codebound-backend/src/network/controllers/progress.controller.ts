import { Request, Response, NextFunction } from 'express';
import progressService from '../../services/progress.service';

class ProgressController {
    /**
     * Update player progress after level completion
     * POST /api/progress/update
     */
    async updateProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { levelCompleted, tokensEarned, timeSpent, hintsUsed, isPerfect } = req.body;

            if (!levelCompleted || tokensEarned === undefined || timeSpent === undefined) {
                return res.status(400).json({
                    error: 'Missing required fields: levelCompleted, tokensEarned, timeSpent'
                });
            }

            const result = await progressService.updateProgress(userId, {
                levelCompleted,
                tokensEarned,
                timeSpent,
                hintsUsed: hintsUsed || 0,
                isPerfect: isPerfect || false,
            });

            res.status(200).json({
                success: true,
                data: result,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const progress = await progressService.getProgress(userId);

            res.status(200).json({
                success: true,
                data: progress,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const completions = await progressService.getLevelCompletions(userId, limit);

            res.status(200).json({
                success: true,
                data: completions,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const stats = await progressService.getPlayerStats(userId);

            res.status(200).json({
                success: true,
                data: stats,
            });
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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await progressService.resetProgress(userId);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ProgressController();
