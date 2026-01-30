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

            await prisma.$transaction(async (tx) => {
                await tx.user.create({
                    data: {
                        username: displayName,
                        email: email,
                        password: passwordHashed
                    }
                })
            })

            const data = {

            }

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
                    username: true,
                    email: true,
                    avatar: true,
                    created_at: true,
                    updated_at: true
                }
            })

            const data = {
                user: user
            }

            this.success(res, data, "SessionToken")
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController;