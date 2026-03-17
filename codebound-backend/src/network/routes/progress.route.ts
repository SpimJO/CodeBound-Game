import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import progressController from '../controllers/progress.controller';

const progress: Router = Router();

// All routes require API key and authentication
progress.use(apiKeyMiddleware, authMiddleware);

// Update progress after level completion
progress
    .route('/update')
    .post((req: Request, res: Response, next: NextFunction) =>
        progressController.updateProgress(req, res, next)
    );

// Get player progress
progress
    .route('/')
    .get((req: Request, res: Response, next: NextFunction) =>
        progressController.getProgress(req, res, next)
    );

// Get level completions
progress
    .route('/levels')
    .get((req: Request, res: Response, next: NextFunction) =>
        progressController.getLevelCompletions(req, res, next)
    );

// Get player statistics
progress
    .route('/stats')
    .get((req: Request, res: Response, next: NextFunction) =>
        progressController.getPlayerStats(req, res, next)
    );

// Reset progress
progress
    .route('/reset')
    .post((req: Request, res: Response, next: NextFunction) =>
        progressController.resetProgress(req, res, next)
    );

// Sync overworld coin tokens (no level change)
progress
    .route('/sync-tokens')
    .post((req: Request, res: Response, next: NextFunction) =>
        progressController.syncTokens(req, res, next)
    );

export default progress;
