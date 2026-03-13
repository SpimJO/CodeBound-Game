import { Request, Response, NextFunction } from 'express';
import Api from '../../lib/api';
import { HttpError } from '../../lib/error';
import problemService from '../../services/problem.service';

class ProblemController extends Api {
    private httpError = new HttpError();

    /**
     * Get a specific problem by level number
     * GET /problems/:level
     */
    async getProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const levelNumber = parseInt(req.params.level);

            if (isNaN(levelNumber) || levelNumber < 1) {
                return next(this.httpError.badRequest('Invalid level number. Must be a positive integer.'));
            }

            const problem = await problemService.getProblemByLevel(levelNumber);
            return this.success(res, problem, 'Problem retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all problems
     * GET /problems
     */
    async getAllProblems(req: Request, res: Response, next: NextFunction) {
        try {
            const problems = await problemService.getAllProblems();
            return this.success(res, problems, 'All problems retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new ProblemController();
