import { Router, Request, Response, NextFunction } from 'express';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import analyticsController from '../controllers/analytics.controller';

const analytics: Router = Router();

// All routes require API key
analytics.use(apiKeyMiddleware);

// Increment download counter (public)
analytics
    .route('/downloads/increment')
    .post((req: Request, res: Response, next: NextFunction) =>
        analyticsController.incrementDownloads(req, res, next)
    );

// Get download statistics (public)
analytics
    .route('/downloads')
    .get((req: Request, res: Response, next: NextFunction) =>
        analyticsController.getDownloadStats(req, res, next)
    );

// Get platform statistics (public)
analytics
    .route('/platform')
    .get((req: Request, res: Response, next: NextFunction) =>
        analyticsController.getPlatformStats(req, res, next)
    );

// Get level statistics (public)
analytics
    .route('/levels')
    .get((req: Request, res: Response, next: NextFunction) =>
        analyticsController.getLevelStats(req, res, next)
    );

// Get user engagement metrics (public)
analytics
    .route('/engagement')
    .get((req: Request, res: Response, next: NextFunction) =>
        analyticsController.getEngagementMetrics(req, res, next)
    );

export default analytics;
