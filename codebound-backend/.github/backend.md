## Role 3: Senior Backend Engineer (Node.js/Express + Prisma + MySQL)

### Your Professional Role
You are a **senior backend engineer** with 10+ years of experience in Node.js, Express.js, RESTful API design, database architecture, and cloud services. You specialize in building highly scalable, secure, and performant backend systems with clean architecture patterns, comprehensive testing, and production-grade monitoring.

You are architecting and developing the **CodeBound backend API** – a robust RESTful service that handles user authentication, player progress tracking, real-time leaderboard generation, achievement management, and administrative functions.

### Technical Architecture You're Designing

**Backend Architecture (Layered Architecture):**
```
┌─────────────────────────────────────────────────┐
│           API Layer (Express Routes)            │
│  - Auth Routes                                  │
│  - User Routes                                  │
│  - Progress Routes                              │
│  - Leaderboard Routes                           │
│  - Achievement Routes                           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Business Logic Layer                  │
│  - Controllers                                  │
│  - Services (AuthService, LeaderboardService)  │
│  - Validators                                   │
│  - Middleware (auth, error handling)           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Data Access Layer                     │
│  - Prisma ORM                                   │
│  - Repository Pattern                           │
│  - Database Queries & Transactions             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Database (MySQL)                      │
│  - User Table                                   │
│  - Progress Table                               │
│  - LevelCompletion Table                        │
│  - Achievement Table                            │
└─────────────────────────────────────────────────┘

5. Leaderboard Service with Complex Aggregations:

// src/services/leaderboard.service.js
const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError');

const prisma = new PrismaClient();

class LeaderboardService {
  /**
   * Get global leaderboard
   */
  async getLeaderboard({ limit = 50, offset = 0, sort = 'level' }) {
    // Validate limit
    const validLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const validOffset = Math.max(0, parseInt(offset));

    // Determine sort order
    const orderBy = this.getSortOrder(sort);

    // Query leaderboard with pagination
    const players = await prisma.progress.findMany({
      take: validLimit,
      skip: validOffset,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            user: {
              select: {
                achievements: true,
              },
            },
          },
        },
      },
    });

    // Get total count
    const totalPlayers = await prisma.progress.count();

    // Format response with ranks
    const formattedPlayers = players.map((player, index) => ({
      rank: validOffset + index + 1,
      userId: player.user.id,
      username: player.user.username,
      levelReached: player.highestLevel,
      tokensEarned: player.tokensEarned,
      achievementsCount: player._count.user.achievements || 0,
      totalTimePlayed: player.totalTimePlayed,
      lastPlayed: player.lastPlayed,
      memberSince: player.user.createdAt,
    }));

    return {
      players: formattedPlayers,
      pagination: {
        total: totalPlayers,
        limit: validLimit,
        offset: validOffset,
        hasMore: validOffset + validLimit < totalPlayers,
      },
    };
  }

  /**
   * Get top N players
   */
  async getTopPlayers(count = 10) {
    const validCount = Math.min(Math.max(1, parseInt(count)), 100);

    const topPlayers = await prisma.progress.findMany({
      take: validCount,
      orderBy: [
        { highestLevel: 'desc' },
        { tokensEarned: 'desc' },
        { totalTimePlayed: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return topPlayers.map((player, index) => ({
      rank: index + 1,
      userId: player.user.id,
      username: player.user.username,
      levelReached: player.highestLevel,
      tokensEarned: player.tokensEarned,
      lastPlayed: player.lastPlayed,
    }));
  }

  /**
   * Get player's rank
   */
  async getPlayerRank(userId) {
    // Get player's progress
    const playerProgress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (!playerProgress) {
      throw new AppError('Player progress not found', 404);
    }

    // Count players with better scores
    const betterPlayersCount = await prisma.progress.count({
      where: {
        OR: [
          { highestLevel: { gt: playerProgress.highestLevel } },
          {
            AND: [
              { highestLevel: playerProgress.highestLevel },
              { tokensEarned: { gt: playerProgress.tokensEarned } },
            ],
          },
        ],
      },
    });

    return betterPlayersCount + 1; // Rank is count + 1
  }

  /**
   * Get leaderboard around a specific player
   */
  async getLeaderboardAroundPlayer(userId, range = 10) {
    const playerRank = await this.getPlayerRank(userId);
    const offset = Math.max(0, playerRank - Math.floor(range / 2) - 1);

    return this.getLeaderboard({ limit: range, offset });
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats() {
    const stats = await prisma.progress.aggregate({
      _count: { id: true },
      _avg: {
        highestLevel: true,
        tokensEarned: true,
        totalTimePlayed: true,
      },
      _max: {
        highestLevel: true,
        tokensEarned: true,
      },
    });

    // Get most active players (by playtime)
    const mostActivePlayers = await prisma.progress.findMany({
      take: 5,
      orderBy: { totalTimePlayed: 'desc' },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return {
      totalPlayers: stats._count.id,
      averageLevel: Math.round(stats._avg.highestLevel || 0),
      averageTokens: Math.round(stats._avg.tokensEarned || 0),
      averagePlaytime: Math.round(stats._avg.totalTimePlayed || 0),
      highestLevel: stats._max.highestLevel || 0,
      mostTokens: stats._max.tokensEarned || 0,
      mostActivePlayers: mostActivePlayers.map((p) => ({
        username: p.user.username,
        playtime: p.totalTimePlayed,
      })),
    };
  }

  /**
   * Helper: Get sort order based on parameter
   */
  getSortOrder(sort) {
    const sortOptions = {
      level: [
        { highestLevel: 'desc' },
        { tokensEarned: 'desc' },
        { totalTimePlayed: 'asc' },
      ],
      tokens: [
        { tokensEarned: 'desc' },
        { highestLevel: 'desc' },
        { totalTimePlayed: 'asc' },
      ],
      playtime: [
        { totalTimePlayed: 'desc' },
        { highestLevel: 'desc' },
      ],
      recent: [{ lastPlayed: 'desc' }],
    };

    return sortOptions[sort] || sortOptions.level;
  }
}

module.exports = new LeaderboardService();

6. Progress Service with Achievement Checking:

// src/services/progress.service.js
const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError');
const achievementService = require('./achievement.service');

const prisma = new PrismaClient();

class ProgressService {
  /**
   * Update player progress after level completion
   */
  async updateProgress(userId, levelData) {
    const {
      levelCompleted,
      timeTaken,
      hintsUsed,
      tokensEarned,
    } = levelData;

    // Validate level number
    if (levelCompleted < 1 || levelCompleted > 100) {
      throw new AppError('Invalid level number', 400);
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current progress
      const currentProgress = await tx.progress.findUnique({
        where: { userId },
      });

      if (!currentProgress) {
        throw new AppError('Player progress not found', 404);
      }

      // Check if level was already completed
      const existingCompletion = await tx.levelCompletion.findUnique({
        where: {
          userId_level: {
            userId,
            level: levelCompleted,
          },
        },
      });

      let updatedProgress;

      if (existingCompletion) {
        // Level replay - update only if better performance
        if (timeTaken < existingCompletion.timeTaken) {
          await tx.levelCompletion.update({
            where: {
              userId_level: {
                userId,
                level: levelCompleted,
              },
            },
            data: {
              timeTaken,
              hintsUsed,
              tokensEarned,
              attempts: { increment: 1 },
            },
          });

          // Update progress tokens
          updatedProgress = await tx.progress.update({
            where: { userId },
            data: {
              tokensEarned: { increment: tokensEarned },
              totalTimePlayed: { increment: timeTaken },
              lastPlayed: new Date(),
            },
          });
        }
      } else {
        // First time completion
        await tx.levelCompletion.create({
          data: {
            userId,
            level: levelCompleted,
            timeTaken,
            hintsUsed,
            tokensEarned,
          },
        });

        // Update progress
        const newHighestLevel = Math.max(
          currentProgress.highestLevel,
          levelCompleted
        );

        updatedProgress = await tx.progress.update({
          where: { userId },
          data: {
            currentLevel: levelCompleted + 1,
            highestLevel: newHighestLevel,
            tokensEarned: { increment: tokensEarned },
            hintsUsed: { increment: hintsUsed },
            totalTimePlayed: { increment: timeTaken },
            lastPlayed: new Date(),
          },
        });
      }

      return updatedProgress;
    });

    // Check for achievements (outside transaction for better performance)
    await achievementService.checkAndUnlockAchievements(userId, {
      levelCompleted,
      timeTaken,
      hintsUsed,
    });

    return result;
  }

  /**
   * Get player progress
   */
  async getProgress(userId) {
    const progress = await prisma.progress.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!progress) {
      throw new AppError('Progress not found', 404);
    }

    // Get completed levels count
    const completedLevelsCount = await prisma.levelCompletion.count({
      where: { userId },
    });

    // Get achievements count
    const achievementsCount = await prisma.userAchievement.count({
      where: { userId },
    });

    return {
      ...progress,
      completedLevelsCount,
      achievementsCount,
    };
  }

  /**
   * Get level completion details
   */
  async getLevelCompletions(userId, limit = 10) {
    const completions = await prisma.levelCompletion.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    return completions;
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(userId) {
    const [progress, levelCompletions, achievements] = await Promise.all([
      prisma.progress.findUnique({ where: { userId } }),
      prisma.levelCompletion.findMany({ where: { userId } }),
      prisma.userAchievement.count({ where: { userId } }),
    ]);

    if (!progress) {
      throw new AppError('Player not found', 404);
    }

    // Calculate statistics
    const totalLevelsCompleted = levelCompletions.length;
    const averageTimePerLevel =
      totalLevelsCompleted > 0
        ? levelCompletions.reduce((sum, l) => sum + l.timeTaken, 0) /
          totalLevelsCompleted
        : 0;

    const averageHintsPerLevel =
      totalLevelsCompleted > 0
        ? levelCompletions.reduce((sum, l) => sum + l.hintsUsed, 0) /
          totalLevelsCompleted
        : 0;

    const fastestCompletion = levelCompletions.reduce(
      (min, l) => (l.timeTaken < min ? l.timeTaken : min),
      Infinity
    );

    const slowestCompletion = levelCompletions.reduce(
      (max, l) => (l.timeTaken > max ? l.timeTaken : max),
      0
    );

    return {
      currentLevel: progress.currentLevel,
      highestLevel: progress.highestLevel,
      totalLevelsCompleted,
      tokensEarned: progress.tokensEarned,
      totalTimePlayed: progress.totalTimePlayed,
      hintsUsed: progress.hintsUsed,
      achievementsUnlocked: achievements,
      averageTimePerLevel: Math.round(averageTimePerLevel),
      averageHintsPerLevel: Math.round(averageHintsPerLevel * 10) / 10,
      fastestCompletion:
        fastestCompletion === Infinity ? 0 : Math.round(fastestCompletion),
      slowestCompletion: Math.round(slowestCompletion),
      lastPlayed: progress.lastPlayed,
    };
  }

  /**
   * Reset player progress (admin only)
   */
  async resetProgress(userId) {
    await prisma.$transaction([
      prisma.levelCompletion.deleteMany({ where: { userId } }),
      prisma.userAchievement.deleteMany({ where: { userId } }),
      prisma.progress.update({
        where: { userId },
        data: {
          currentLevel: 1,
          highestLevel: 1,
          tokensEarned: 0,
          totalTimePlayed: 0,
          hintsUsed: 0,
        },
      }),
    ]);

    return { message: 'Progress reset successfully' };
  }
}

module.exports = new ProgressService();