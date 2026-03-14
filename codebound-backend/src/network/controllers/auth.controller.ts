import Api from "@/lib/api";
import { HttpError } from "@/lib/error";
import { Request, Response, NextFunction } from "express";
import authService from "../../services/auth.service";

class AuthController extends Api {
    private httpError = new HttpError();

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, identifier, password } = req.body;
            console.log("[AuthController] /auth/login payload", {
                hasUsername: typeof username === "string" && username.length > 0,
                hasIdentifier: typeof identifier === "string" && identifier.length > 0,
                passwordLength: typeof password === "string" ? password.length : 0,
            });
            const loginIdentifier = identifier || username;
            const data = await authService.login(loginIdentifier, password);
            return this.success(res, data, "Login successful");
        } catch (error) {
            next(error);
        }
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;
            console.log("[AuthController] /auth/register payload", {
                username,
                passwordLength: typeof password === "string" ? password.length : 0,
            });
            const data = await authService.register(username, password);
            return this.created(res, data, "Registration successful");
        } catch (error) {
            next(error);
        }
    }

    public async sessionToken(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            const data = await authService.validateSession(userId);
            return this.success(res, data, "Session valid");
        } catch (error) {
            next(error);
        }
    }

    public async profile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            const data = await authService.validateSession(userId);
            return this.success(res, data, "Profile fetched successfully");
        } catch (error) {
            next(error);
        }
    }

    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            const { username, avatar, currentPassword, newPassword } = req.body;
            const data = await authService.updateProfile(userId, username, avatar, currentPassword, newPassword);
            return this.success(res, data, "Profile updated successfully");
        } catch (error) {
            next(error);
        }
    }

    public async deleteProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            await authService.deleteAccount(userId);
            return this.success(res, null, "Account deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;