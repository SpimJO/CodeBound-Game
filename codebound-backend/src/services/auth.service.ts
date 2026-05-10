import { prisma } from '@/lib/prisma';
import { userPublicSelect, userWithProgressSelect, type UserData, type UserWithProgress } from '@/lib/userSelect';
import { HttpError } from '../lib/error';
import { Bcrypt } from '../lib/bcrypt';
import { CipherToken } from '../lib/token';
import appConfig from '../config';

const httpError = new HttpError();
const bcrypt = new Bcrypt();
const cipherToken = new CipherToken(appConfig.ENC_KEY_SECRET, appConfig.CIPHER_KEY_SECRET);

export type { UserData, UserWithProgress } from '@/lib/userSelect';

class AuthService {
    /**
     * Authenticate user and generate token
     */
    async login(identifier: string, password: string): Promise<{
        user: { id: string; username: string };
        token: string;
    }> {
        if (!identifier || !password) {
            throw httpError.badRequest("Identifier and password are required");
        }

        // Username-only auth.
        const user = await prisma.user.findUnique({
            where: { username: identifier.trim() }
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
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
            issuedAt: Date.now()
        });

        return {
            user: {
                id: user.id,
                username: user.username,
            },
            token: encryptToken,
        };
    }

    /**
     * Register new user with initial progress and leaderboard entry
     */
    async register(username: string, password: string): Promise<{
        user: { id: string; username: string };
        token: string;
    }> {
        const displayName = username?.trim() || "Player";

        if (!displayName || !password) {
            throw httpError.badRequest("Username and password are required");
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                username: displayName
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
                    equippedCharacter: "default"
                }
            });

            // Default starter ownership so Ranger appears in character dropdown.
            await tx.userCharacter.create({
                data: {
                    userId: user.id,
                    characterId: 'ranger',
                },
            });

            return user;
        });

        // Generate token for automatic login
        const encryptToken = await cipherToken.encrypt({
            id: newUser.id,
            username: newUser.username,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
            issuedAt: Date.now()
        });

        return {
            user: {
                id: newUser.id,
                username: newUser.username,
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
            select: userWithProgressSelect,
        });

        if (!user) {
            throw httpError.notFound("User not found");
        }

        return { user };
    }

    /**
     * Update user profile (username and/or password)
     */
    async updateProfile(
        userId: string,
        username?: string,
        currentPassword?: string,
        newPassword?: string,
        old_user?: number
    ): Promise<{ user: UserData }> {
        const trimmedUsername = username?.trim();

        // Check if username is taken by another user
        if (trimmedUsername) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: trimmedUsername,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                throw httpError.conflict("Username already taken");
            }
        }

        let nextPasswordHash: string | undefined;
        if (newPassword) {
            if (newPassword.length < 6) {
                throw httpError.badRequest("New password must be at least 6 characters");
            }

            if (currentPassword) {
                const existingUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { password: true }
                });

                if (!existingUser) {
                    throw httpError.notFound("User not found");
                }

                const isCurrentValid = await bcrypt.compare(currentPassword, existingUser.password);
                if (!isCurrentValid) {
                    throw httpError.unauthorized("Current password is incorrect");
                }
            }

            nextPasswordHash = await bcrypt.hash(newPassword);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(trimmedUsername && { username: trimmedUsername }),
                ...(nextPasswordHash && { password: nextPasswordHash }),
                ...(old_user !== undefined && { old_user })
            },
            select: userPublicSelect,
        });

        return { user: updatedUser };
    }

    /**
     * Mark the tutorial as completed for a user.
     */
    async completeTutorial(userId: string): Promise<{ user: UserData }> {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                old_user: 1,
            },
            select: userPublicSelect,
        });

        return { user: updatedUser };
    }

    /**
     * Delete user account and related user-owned records.
     */
    async deleteAccount(userId: string): Promise<void> {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!existingUser) {
            throw httpError.notFound("User not found");
        }

        await prisma.user.delete({ where: { id: userId } });
    }
}

export default new AuthService();
