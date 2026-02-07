import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';
import { Bcrypt } from '../lib/bcrypt';
import { CipherToken } from '../lib/token';
import appConfig from '../config';

const httpError = new HttpError();
const bcrypt = new Bcrypt();
const cipherToken = new CipherToken(appConfig.ENC_KEY_SECRET, appConfig.CIPHER_KEY_SECRET);

interface UserData {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    created_at: Date;
    updated_at: Date;
}

interface UserWithProgress extends UserData {
    progress: {
        currentLevel: number;
        highestLevel: number;
        totalTokens: number;
        totalPlayTime: number;
        equippedSkin: string;
        lastPlayed: Date | null;
    } | null;
}

class AuthService {
    /**
     * Authenticate user and generate token
     */
    async login(username: string, password: string): Promise<{ token: string }> {
        if (!username || !password) {
            throw httpError.badRequest("Username and password are required");
        }

        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw httpError.notFound("User Not Found");
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw httpError.unauthorized("Invalid Credentials");
        }

        // Generate token
        const encryptToken = await cipherToken.encrypt({
            id: user.id,
            username: user.username,
            email: user.email,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
            issuedAt: Date.now()
        });

        return { token: encryptToken };
    }

    /**
     * Register new user with initial progress and leaderboard entry
     */
    async register(username: string, email: string, password: string): Promise<{
        user: { id: string; username: string; email: string };
        token: string;
    }> {
        const displayName = username?.trim() || email?.split("@")[0] || "Player";

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username: displayName }]
            }
        });

        if (existingUser) {
            throw httpError.conflict("Account is already taken");
        }

        // Hash password
        const passwordHashed = await bcrypt.hash(password);

        // Create user with initial progress and leaderboard entry in transaction
        const newUser = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    username: displayName,
                    email: email,
                    password: passwordHashed
                }
            });

            // Initialize user progress
            await tx.userProgress.create({
                data: {
                    userId: user.id,
                    currentLevel: 1,
                    highestLevel: 1,
                    totalTokens: 0,
                    totalPlayTime: 0,
                    equippedSkin: "default"
                }
            });

            // Initialize leaderboard entry
            await tx.leaderboard.create({
                data: {
                    userId: user.id,
                    username: displayName,
                    highestLevel: 1,
                    totalTokens: 0,
                    achievementsCount: 0
                }
            });

            return user;
        });

        // Generate token for automatic login
        const encryptToken = await cipherToken.encrypt({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
            issuedAt: Date.now()
        });

        return {
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            },
            token: encryptToken
        };
    }

    /**
     * Validate session and get user with progress
     */
    async validateSession(userId: string): Promise<{ user: UserWithProgress }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                created_at: true,
                updated_at: true,
                progress: {
                    select: {
                        currentLevel: true,
                        highestLevel: true,
                        totalTokens: true,
                        totalPlayTime: true,
                        equippedSkin: true,
                        lastPlayed: true
                    }
                }
            }
        });

        if (!user) {
            throw httpError.notFound("User not found");
        }

        return { user };
    }

    /**
     * Update user profile (username and/or avatar)
     */
    async updateProfile(userId: string, username?: string, avatar?: string): Promise<{ user: UserData }> {
        // Check if username is taken by another user
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                throw httpError.conflict("Username already taken");
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(username && { username }),
                ...(avatar && { avatar })
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                created_at: true,
                updated_at: true
            }
        });

        // Update username in leaderboard if changed
        if (username) {
            await prisma.leaderboard.update({
                where: { userId },
                data: { username }
            });
        }

        return { user: updatedUser };
    }
}

export default new AuthService();
