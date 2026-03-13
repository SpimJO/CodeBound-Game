import Api from "@/lib/api";
import { HttpError } from "@/lib/error";
import { Request, Response, NextFunction } from "express";
import authService from "../../services/auth.service";

class AuthController extends Api {
    private httpError = new HttpError();

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, identifier, password } = req.body;
            const loginIdentifier = identifier || email || username;
            const data = await authService.login(loginIdentifier, password);
            return this.success(res, data, "Login successful");
        } catch (error) {
            next(error);
        }
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const data = await authService.register(username, email, password);
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

    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            const { username, avatar } = req.body;
            const data = await authService.updateProfile(userId, username, avatar);
            return this.success(res, data, "Profile updated successfully");
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;