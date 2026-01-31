import { Request, Response, NextFunction } from 'express';
import gameSessionService from '../../services/gameSession.service';

class GameSessionController {
    /**
     * Start a new game session
     * POST /api/sessions/start
     */
    async startSession(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const session = await gameSessionService.startSession(userId);

            res.status(201).json({
                success: true,
                data: session,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * End a game session
     * POST /api/sessions/:sessionId/end
     */
    async endSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const { levelsPlayed, tokensEarned } = req.body;

            if (levelsPlayed === undefined || tokensEarned === undefined) {
                return res.status(400).json({
                    error: 'levelsPlayed and tokensEarned are required'
                });
            }

            const session = await gameSessionService.endSession(
                sessionId,
                levelsPlayed,
                tokensEarned
            );

            res.status(200).json({
                success: true,
                data: session,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's game sessions
     * GET /api/sessions
     */
    async getUserSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const sessions = await gameSessionService.getUserSessions(userId, limit);

            res.status(200).json({
                success: true,
                data: sessions,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active session for user
     * GET /api/sessions/active
     */
    async getActiveSession(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const session = await gameSessionService.getActiveSession(userId);

            res.status(200).json({
                success: true,
                data: session,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get session statistics for user
     * GET /api/sessions/stats
     */
    async getSessionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const stats = await gameSessionService.getSessionStats(userId);

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new GameSessionController();
