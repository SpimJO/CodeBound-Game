import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import leaderboardController from '../controllers/leaderboard.controller';

const leaderboard: Router = Router();

// All routes require API key
leaderboard.use(apiKeyMiddleware);

// Get global leaderboard (public)
leaderboard
    .route('/')
    .get((req: Request, res: Response, next: NextFunction) =>
        leaderboardController.getLeaderboard(req, res, next)
    );

// Get top N players (public)
leaderboard
    .route('/top/:count?')
    .get((req: Request, res: Response, next: NextFunction) =>
        leaderboardController.getTopPlayers(req, res, next)
    );

// Get leaderboard statistics (public)
leaderboard
    .route('/stats')
    .get((req: Request, res: Response, next: NextFunction) =>
        leaderboardController.getLeaderboardStats(req, res, next)
    );

// Get player's rank (requires auth)
leaderboard
    .route('/rank')
    .get(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        leaderboardController.getPlayerRank(req, res, next)
    );

// Get leaderboard around player (requires auth)
leaderboard
    .route('/around-me')
    .get(authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        leaderboardController.getLeaderboardAroundPlayer(req, res, next)
    );

export default leaderboard;
