import { Request, Response, NextFunction } from 'express';
import skinService from '../../services/skin.service';

class SkinController {
    /**
     * Get user's owned skins
     * GET /api/skins
     */
    async getUserSkins(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const skins = await skinService.getUserSkins(userId);

            res.status(200).json({
                success: true,
                data: skins,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available skins catalog
     * GET /api/skins/available
     */
    async getAvailableSkins(req: Request, res: Response, next: NextFunction) {
        try {
            const skins = await skinService.getAvailableSkins();

            res.status(200).json({
                success: true,
                data: skins,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Purchase a skin
     * POST /api/skins/purchase
     */
    async purchaseSkin(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { skinId, tokenCost } = req.body;

            if (!skinId || tokenCost === undefined) {
                return res.status(400).json({ error: 'skinId and tokenCost are required' });
            }

            const result = await skinService.purchaseSkin(userId, skinId, tokenCost);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Equip a skin
     * POST /api/skins/equip
     */
    async equipSkin(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { skinId } = req.body;

            if (!skinId) {
                return res.status(400).json({ error: 'skinId is required' });
            }

            const progress = await skinService.equipSkin(userId, skinId);

            res.status(200).json({
                success: true,
                data: progress,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Check skin ownership
     * GET /api/skins/:skinId/owned
     */
    async checkSkinOwnership(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { skinId } = req.params;
            const owned = await skinService.checkSkinOwnership(userId, skinId);

            res.status(200).json({
                success: true,
                data: { owned },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SkinController();
