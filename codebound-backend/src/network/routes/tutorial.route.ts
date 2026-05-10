import { authMiddleware } from '@/middleware/auth';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import TutorialController from '../controllers/tutorial.controller';
import { NextFunction, Request, Response, Router } from 'express';

const tutorial: Router = Router();
const tutorialController = new TutorialController();

tutorial
    .route('/theme-complete')
    .post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) =>
        tutorialController.completeThemeTutorial(req, res, next),
    );

export default tutorial;
