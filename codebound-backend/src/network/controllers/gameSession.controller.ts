import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import { HttpError } from '../../lib/error';
import gameSessionService from '../../services/gameSession.service';

class GameSessionController extends Api {
    private httpError = new HttpError();

    /**
     * Start a new game session
     * POST /api/sessions/start
     */
    async startSession(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const session = await gameSessionService.startSession(userId);
            return this.created(res, session, 'Game session started successfully');
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
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { sessionId } = req.params;
            const { levelsPlayed, tokensEarned } = req.body;

            if (levelsPlayed === undefined || tokensEarned === undefined) {
                return next(this.httpError.badRequest('levelsPlayed and tokensEarned are required'));
            }

            const session = await gameSessionService.endSession(
                userId,
                sessionId,
                levelsPlayed,
                tokensEarned
            );

            return this.success(res, session, 'Game session ended successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const sessions = await gameSessionService.getUserSessions(userId, limit);

            return this.success(res, sessions, 'Sessions retrieved successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const session = await gameSessionService.getActiveSession(userId);
            return this.success(res, session, 'Active session retrieved successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const stats = await gameSessionService.getSessionStats(userId);
            return this.success(res, stats, 'Session statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new GameSessionController();
