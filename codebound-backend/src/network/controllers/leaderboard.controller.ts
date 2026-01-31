import { Request, Response, NextFunction } from 'express';
import leaderboardService from '../../services/leaderboard.service';

class LeaderboardController {
    /**
     * Get global leaderboard
     * GET /api/leaderboard
     */
    async getLeaderboard(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const sort = (req.query.sort as 'level' | 'tokens' | 'playtime' | 'recent') || 'level';

            const result = await leaderboardService.getLeaderboard({ limit, offset, sort });

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get top N players
     * GET /api/leaderboard/top/:count?
     */
    async getTopPlayers(req: Request, res: Response, next: NextFunction) {
        try {
            const count = parseInt(req.params.count) || 10;
            const result = await leaderboardService.getTopPlayers(count);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get player's rank
     * GET /api/leaderboard/rank
     */
    async getPlayerRank(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const rank = await leaderboardService.getPlayerRank(userId);

            res.status(200).json({
                success: true,
                data: { rank },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get leaderboard around a specific player
     * GET /api/leaderboard/around-me
     */
    async getLeaderboardAroundPlayer(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const range = parseInt(req.query.range as string) || 10;
            const result = await leaderboardService.getLeaderboardAroundPlayer(userId, range);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get leaderboard statistics
     * GET /api/leaderboard/stats
     */
    async getLeaderboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await leaderboardService.getLeaderboardStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new LeaderboardController();
