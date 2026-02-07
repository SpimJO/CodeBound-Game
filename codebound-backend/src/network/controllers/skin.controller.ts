import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import { HttpError } from '../../lib/error';
import skinService from '../../services/skin.service';

class SkinController extends Api {
    private httpError = new HttpError();

    /**
     * Get user's owned skins
     * GET /api/skins
     */
    async getUserSkins(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const skins = await skinService.getUserSkins(userId);
            return this.success(res, skins, 'User skins retrieved successfully');
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
            return this.success(res, skins, 'Available skins retrieved successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { skinId, tokenCost } = req.body;

            if (!skinId || tokenCost === undefined) {
                return next(this.httpError.badRequest('skinId and tokenCost are required'));
            }

            const result = await skinService.purchaseSkin(userId, skinId, tokenCost);
            return this.success(res, result, 'Skin purchased successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { skinId } = req.body;

            if (!skinId) {
                return next(this.httpError.badRequest('skinId is required'));
            }

            const progress = await skinService.equipSkin(userId, skinId);
            return this.success(res, progress, 'Skin equipped successfully');
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
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const { skinId } = req.params;
            const owned = await skinService.checkSkinOwnership(userId, skinId);
            return this.success(res, { owned }, 'Skin ownership checked successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new SkinController();
