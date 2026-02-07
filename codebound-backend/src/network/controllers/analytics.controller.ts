import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import analyticsService from '../../services/analytics.service';

class AnalyticsController extends Api {
    /**
     * Increment download counter
     * POST /api/analytics/downloads/increment
     */
    async incrementDownloads(req: Request, res: Response, next: NextFunction) {
        try {
            const counter = await analyticsService.incrementDownloads();
            return this.success(res, counter, 'Download count incremented successfully');
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
            return this.success(res, stats, 'Download statistics retrieved successfully');
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
            return this.success(res, stats, 'Platform statistics retrieved successfully');
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
            return this.success(res, stats, 'Level statistics retrieved successfully');
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
            return this.success(res, metrics, 'Engagement metrics retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new AnalyticsController();
