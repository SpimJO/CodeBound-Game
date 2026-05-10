import Api from '@/lib/api';
import { HttpError } from '@/lib/error';
import { Request, Response, NextFunction } from 'express';
import tutorialService from '../../services/tutorial.service';

class TutorialController extends Api {
    private httpError = new HttpError();

    /**
     * POST body: { "theme": "one" | "two" | "three" } — matches level 26 / 51 / 76 theme intros.
     */
    public async completeThemeTutorial(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized('Unauthorized'));
            }

            const theme = tutorialService.parseTheme(req.body);
            const data = await tutorialService.completeThemeTutorial(userId, theme);
            return this.success(res, data, 'Theme tutorial completion saved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default TutorialController;
