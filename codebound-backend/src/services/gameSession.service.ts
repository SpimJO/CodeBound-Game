import { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/error';

const prisma = new PrismaClient();

class GameSessionService {
    /**
     * Start a new game session
     */
    async startSession(userId: string) {
        const session = await prisma.gameSession.create({
            data: {
                userId,
                startedAt: new Date(),
            },
        });

        return session;
    }

    /**
     * End a game session
     */
    async endSession(sessionId: string, levelsPlayed: number, tokensEarned: number) {
        const session = await prisma.gameSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new HttpError(404, 'Session not found');
        }

        if (session.endedAt) {
            throw new HttpError(400, 'Session already ended');
        }

        const endedAt = new Date();
        const duration = (endedAt.getTime() - session.startedAt.getTime()) / 1000; // in seconds

        const updatedSession = await prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                endedAt,
                duration,
                levelsPlayed,
                tokensEarned,
            },
        });

        return updatedSession;
    }

    /**
     * Get user's game sessions
     */
    async getUserSessions(userId: string, limit = 10) {
        const sessions = await prisma.gameSession.findMany({
            where: { userId },
            take: limit,
            orderBy: { startedAt: 'desc' },
        });

        return sessions;
    }

    /**
     * Get active session for user
     */
    async getActiveSession(userId: string) {
        const session = await prisma.gameSession.findFirst({
            where: {
                userId,
                endedAt: null,
            },
            orderBy: { startedAt: 'desc' },
        });

        return session;
    }

    /**
     * Get session statistics for user
     */
    async getSessionStats(userId: string) {
        const stats = await prisma.gameSession.aggregate({
            where: {
                userId,
                endedAt: { not: null },
            },
            _count: { id: true },
            _sum: {
                duration: true,
                levelsPlayed: true,
                tokensEarned: true,
            },
            _avg: {
                duration: true,
                levelsPlayed: true,
                tokensEarned: true,
            },
        });

        const longestSession = await prisma.gameSession.findFirst({
            where: {
                userId,
                endedAt: { not: null },
            },
            orderBy: { duration: 'desc' },
        });

        return {
            totalSessions: stats._count.id,
            totalPlayTime: stats._sum.duration || 0,
            totalLevelsPlayed: stats._sum.levelsPlayed || 0,
            totalTokensEarned: stats._sum.tokensEarned || 0,
            averageSessionDuration: stats._avg.duration || 0,
            averageLevelsPerSession: stats._avg.levelsPlayed || 0,
            averageTokensPerSession: stats._avg.tokensEarned || 0,
            longestSessionDuration: longestSession?.duration || 0,
        };
    }
}

export default new GameSessionService();
