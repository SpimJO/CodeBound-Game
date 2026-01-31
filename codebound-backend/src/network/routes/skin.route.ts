import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import skinController from '../controllers/skin.controller';

const skin: Router = Router();

// Public route for available skins
skin
    .route('/available')
    .get(apiKeyMiddleware, (req: Request, res: Response, next: NextFunction) =>
        skinController.getAvailableSkins(req, res, next)
    );

// Protected routes (require API key and auth)
skin.use(apiKeyMiddleware, authMiddleware);

// Get user's owned skins
skin
    .route('/')
    .get((req: Request, res: Response, next: NextFunction) =>
        skinController.getUserSkins(req, res, next)
    );

// Purchase a skin
skin
    .route('/purchase')
    .post((req: Request, res: Response, next: NextFunction) =>
        skinController.purchaseSkin(req, res, next)
    );

// Equip a skin
skin
    .route('/equip')
    .post((req: Request, res: Response, next: NextFunction) =>
        skinController.equipSkin(req, res, next)
    );

// Check skin ownership
skin
    .route('/:skinId/owned')
    .get((req: Request, res: Response, next: NextFunction) =>
        skinController.checkSkinOwnership(req, res, next)
    );

export default skin;
