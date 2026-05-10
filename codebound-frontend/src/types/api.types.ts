// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        statusCode: number;
        rawErrors: string[];
    };
}

// Auth Types
export interface User {
    id: string;
    username: string;
    created_at: string;
    updated_at: string;
}

export interface UserProgress {
    currentLevel: number;
    highestLevel: number;
    totalTokens: number;
    equippedSkin: string;
    lastPlayed: string;
}

export interface UserWithProgress extends User {
    progress: UserProgress | null;
}

export interface LoginRequest {
    identifier?: string;
    username?: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user?: {
            id: string;
            username: string;
        };
        token: string;
    };
}

export interface SessionResponse {
    success: boolean;
    message: string;
    data: {
        user: UserWithProgress;
    };
}

export interface UpdateProfileRequest {
    username?: string;
}

// Progress Types
export interface LevelCompletion {
    id: string;
    userId: string;
    levelNumber: number;
    tokensEarned: number;
    attemptsCount: number;
    completedAt: string;
}

export interface UpdateProgressRequest {
    levelCompleted: number;
    tokensEarned: number;
}

export interface ProgressStats {
    currentLevel: number;
    highestLevel: number;
    totalLevelsCompleted: number;
    tokensEarned: number;
    achievementsUnlocked: number;
    lastPlayed: string;
}

export interface ProgressWithDetails {
    id: string;
    userId: string;
    currentLevel: number;
    highestLevel: number;
    totalTokens: number;
    lastPlayed: string;
    equippedSkin: string;
    created_at: string;
    updated_at: string;
    user: {
        username: string;
        createdAt: string;
    };
    completedLevelsCount: number;
    achievementsCount: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    highestLevel: number;
    totalTokens: number;
    achievementsCount: number;
    lastUpdated: string;
}

export interface LeaderboardPlayer {
    rank: number;
    userId: string;
    username: string;
    levelReached: number;
    tokensEarned: number;
    achievementsCount: number;
    lastPlayed: string;
    memberSince: string;
}

export interface LeaderboardResponse {
    players: LeaderboardPlayer[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface LeaderboardStats {
    totalPlayers: number;
    averageLevel: number;
    averageTokens: number;
    highestLevel: number;
    mostTokens: number;
    mostActivePlayers: Array<{
        username: string;
        lastPlayed: string;
    }>;
}

// Community Types
export interface CommunityPost {
    id: string;
    userId: string;
    content: string;
    likes: number;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        username: string;
    };
    comments?: CommunityComment[];
    _count?: {
        comments: number;
    };
}

export interface CommunityComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    created_at: string;
    user: {
        id: string;
        username: string;
    };
}

export interface CreatePostRequest {
    content: string;
}

export interface UpdatePostRequest {
    content: string;
}

export interface AddCommentRequest {
    content: string;
}

export interface CommunityPostsResponse {
    posts: CommunityPost[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

// Achievement Types
export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    unlockedAt: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    requirement: number;
    rewardTokens: number;
}

export interface AchievementWithProgress extends Achievement {
    userProgress?: UserAchievement;
    isUnlocked: boolean;
}

// Skin Types
export interface Skin {
    id: string;
    name: string;
    description: string;
    price: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    imageUrl: string;
}

export interface UserSkin {
    id: string;
    userId: string;
    skinId: string;
    purchasedAt: string;
    purchasedWithTokens: number;
}

export interface SkinWithOwnership extends Skin {
    isOwned: boolean;
    userSkin?: UserSkin;
}

export interface PlayerStats {
    totalPlayers: number;
    activePlayers: number;
    newPlayersToday: number;
    averagePlaytime: number;
}

export interface LevelAnalytics {
    levelNumber: number;
    completionRate: number;
    averageTime: number;
    averageAttempts: number;
    averageHints: number;
}

export interface PlatformStats {
    totalSessions: number;
    averageSessionDuration: number;
    mostPlayedLevels: Array<{
        levelNumber: number;
        playCount: number;
    }>;
}

export interface LevelStat {
    level: number;
    completions: number;
    averageTime: number;
    averageTokens: number;
    averageHints: number;
}
