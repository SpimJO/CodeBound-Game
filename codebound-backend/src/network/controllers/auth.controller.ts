import Api from "@/lib/api";
import prisma from "@/db/prisma";
import appConfig from "@/config";
import { Bcrypt } from "@/lib/bcrypt";
import { HttpError } from "@/lib/error";
import { CipherToken } from "@/lib/token";
import { Request, Response, NextFunction } from "express";

class AuthController extends Api {
    private bcrypt = new Bcrypt()
    private httpError = new HttpError()
    private cipherToken = new CipherToken(appConfig.ENC_KEY_SECRET, appConfig.CIPHER_KEY_SECRET);

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = await req.body;

            const user = await prisma.user.findFirst({
                where: { email: email }
            })

            if (!user) {
                return this.httpError.notFound("User Not Found")
            }

            const passwordMatch = await this.bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return this.httpError.unauthorized("Invalid Credentials");
            }

            const encryptToken = await this.cipherToken.encrypt({
                id: user.id,
                username: user.username,
                email: user.email,
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
                issuedAt: Date.now()
            })

            const data = {
                token: encryptToken
            }

            this.success(res, data, "Login Route")
        } catch (error) {
            next(error)
        }
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = await req.body;
            const displayName = username?.trim() || email?.split("@")[0] || "Player";

            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [{ email }, { username: displayName }]
                }
            });

            if (existingUser) {
                return this.httpError.conflict("Account is already taken")
            }

            const passwordHashed = await this.bcrypt.hash(password);

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

            // Generate token for automatic login after registration
            const encryptToken = await this.cipherToken.encrypt({
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
                issuedAt: Date.now()
            });

            const data = {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                },
                token: encryptToken
            };

            this.created(res, data, "Register Route")
        } catch (error) {
            next(error)
        }
    }

    public async sessionToken(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
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
                return this.httpError.notFound("User not found");
            }

            const data = {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    progress: user.progress
                }
            };

            this.success(res, data, "SessionToken")
        } catch (error) {
            next(error)
        }
    }

    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return this.httpError.unauthorized("Unauthorized");
            }

            const { username, avatar } = req.body;

            // Check if username is taken by another user
            if (username) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username,
                        NOT: { id: userId }
                    }
                });

                if (existingUser) {
                    return this.httpError.conflict("Username already taken");
                }
            }

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

            const data = {
                user: updatedUser
            };

            this.success(res, data, "Profile Updated");
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;