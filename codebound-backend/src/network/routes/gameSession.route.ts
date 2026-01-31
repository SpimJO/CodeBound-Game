import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import gameSessionController from '../controllers/gameSession.controller';

const gameSession: Router = Router();

// All routes require API key and authentication
gameSession.use(apiKeyMiddleware, authMiddleware);

// Start a new game session
gameSession
    .route('/start')
    .post((req: Request, res: Response, next: NextFunction) =>
        gameSessionController.startSession(req, res, next)
    );

// End a game session
gameSession
    .route('/:sessionId/end')
    .post((req: Request, res: Response, next: NextFunction) =>
        gameSessionController.endSession(req, res, next)
    );

// Get user's game sessions
gameSession
    .route('/')
    .get((req: Request, res: Response, next: NextFunction) =>
        gameSessionController.getUserSessions(req, res, next)
    );

// Get active session
gameSession
    .route('/active')
    .get((req: Request, res: Response, next: NextFunction) =>
        gameSessionController.getActiveSession(req, res, next)
    );

// Get session statistics
gameSession
    .route('/stats')
    .get((req: Request, res: Response, next: NextFunction) =>
        gameSessionController.getSessionStats(req, res, next)
    );

export default gameSession;
