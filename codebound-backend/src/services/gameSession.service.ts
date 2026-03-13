import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';

class GameSessionService {
    /**
     * Start a new game session
     */
    async startSession(userId: string) {
        const active = await prisma.gameSession.findFirst({
            where: { userId, endedAt: null },
            orderBy: { startedAt: 'desc' },
        });

        if (active) {
            return active;
        }

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
    async endSession(userId: string, sessionId: string, levelsPlayed: number, tokensEarned: number) {
        if (levelsPlayed < 0 || tokensEarned < 0) {
            throw new HttpError(400, 'levelsPlayed and tokensEarned must be >= 0');
        }

        // Single query - verify session ownership and get session
        const existingSession = await prisma.gameSession.findUnique({
            where: { id: sessionId },
        });

        if (!existingSession) {
            throw new HttpError(404, 'Session not found');
        }

        if (existingSession.userId !== userId) {
            throw new HttpError(403, 'Unauthorized: session does not belong to user');
        }

        if (existingSession.endedAt) {
            // Idempotent end-session behavior for client retries.
            return existingSession;
        }

        const endedAt = new Date();
        const duration = (endedAt.getTime() - existingSession.startedAt.getTime()) / 1000; // in seconds

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
        const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
        const sessions = await prisma.gameSession.findMany({
            where: { userId },
            take: safeLimit,
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
