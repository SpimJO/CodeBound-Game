import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import { HttpError } from '../../lib/error';
import leaderboardService from '../../services/leaderboard.service';

class LeaderboardController extends Api {
    private httpError = new HttpError();
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
            return this.success(res, result, 'Leaderboard retrieved successfully');
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
            return this.success(res, result, `Top ${count} players retrieved successfully`);
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const rank = await leaderboardService.getPlayerRank(userId);
            return this.success(res, { rank }, 'Player rank retrieved successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const range = parseInt(req.query.range as string) || 10;
            const result = await leaderboardService.getLeaderboardAroundPlayer(userId, range);
            return this.success(res, result, 'Leaderboard around player retrieved successfully');
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
            return this.success(res, stats, 'Leaderboard statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new LeaderboardController();
