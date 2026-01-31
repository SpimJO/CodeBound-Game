import { Request, Response, NextFunction } from 'express';
import analyticsService from '../../services/analytics.service';

class AnalyticsController {
    /**
     * Increment download counter
     * POST /api/analytics/downloads/increment
     */
    async incrementDownloads(req: Request, res: Response, next: NextFunction) {
        try {
            const counter = await analyticsService.incrementDownloads();

            res.status(200).json({
                success: true,
                data: counter,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get download statistics
     * GET /api/analytics/downloads
     */
    async getDownloadStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await analyticsService.getDownloadStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get platform statistics
     * GET /api/analytics/platform
     */
    async getPlatformStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await analyticsService.getPlatformStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get level statistics
     * GET /api/analytics/levels
     */
    async getLevelStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await analyticsService.getLevelStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user engagement metrics
     * GET /api/analytics/engagement
     */
    async getEngagementMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const metrics = await analyticsService.getEngagementMetrics();

            res.status(200).json({
                success: true,
                data: metrics,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AnalyticsController();
