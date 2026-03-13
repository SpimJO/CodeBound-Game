import { Request, Response, NextFunction } from 'express';
import Api from '../../lib/api';
import { HttpError } from '../../lib/error';
import skinService from '../../services/skin.service';

class SkinController extends Api {
    private httpError = new HttpError();

    /**
     * Get user's current equipped character
     * GET /characters
     */
    async getUserCharacterState(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const characterState = await skinService.getUserCharacterState(userId);
            return this.success(res, characterState, 'Character state retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Equip a character
     * POST /characters/equip
     */
    async equipCharacter(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const characterId = req.body?.characterId || req.body?.skinId;

            if (!characterId) {
                return next(this.httpError.badRequest('characterId is required'));
            }

            const progress = await skinService.equipCharacter(userId, characterId);
            return this.success(res, progress, 'Character equipped successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new SkinController();
