import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import skinController from '../controllers/skin.controller';

const skin: Router = Router();

// Protected routes (require API key and auth)
skin.use(apiKeyMiddleware, authMiddleware);

// Get user's current character state
skin
    .route('/')
    .get((req: Request, res: Response, next: NextFunction) =>
        skinController.getUserCharacterState(req, res, next)
    );

// Equip a character
skin
    .route('/equip')
    .post((req: Request, res: Response, next: NextFunction) =>
        skinController.equipCharacter(req, res, next)
    );

export default skin;
