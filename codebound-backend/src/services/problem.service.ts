import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/error';

class ProblemService {
    private httpError = new HttpError();

    /**
     * Get a specific problem by level number
     */
    async getProblemByLevel(levelNumber: number) {
        const problem = await prisma.levelProblem.findUnique({
            where: { levelNumber }
        });

        if (!problem) {
            throw this.httpError.notFound(`Problem for level ${levelNumber} not found`);
        }

        return problem;
    }

    /**
     * Get all problems (useful for frontend dashboard/admin)
     */
    async getAllProblems() {
        return prisma.levelProblem.findMany({
            orderBy: { levelNumber: 'asc' }
        });
    }
}

export default new ProblemService();
