import auth from "./routes/auth.route";
import tutorial from "./routes/tutorial.route";
import progress from "./routes/progress.route";
import leaderboard from "./routes/leaderboard.route";
import achievement from "./routes/achievement.route";
import community from "./routes/community.route";
import skin from "./routes/skin.route";
import problem from "./routes/problem.route";
import { baseRouter } from "@/lib/baseRouter";
import { Request, Response } from "express";


class AppRouter extends baseRouter {
    protected initRoutes(): void {
        // Health check endpoint (no API key required)
        this.router.get("/health", (req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: "CodeBound API is healthy",
                timestamp: new Date().toISOString(),
                version: process.env.VERSION || "v1"
            });
        });

        // Authentication
        this.router.use("/auth", auth);

        // Theme tutorials (level 26 / 51 / 76 intros)
        this.router.use("/tutorial", tutorial);

        // Core Game Features
        this.router.use("/progress", progress);
        this.router.use("/problems", problem);
        this.router.use("/leaderboard", leaderboard);
        this.router.use("/achievements", achievement);
        this.router.use("/characters", skin);
        this.router.use("/skins", skin);

        // Community & Social
        this.router.use("/community", community);
    }
}

export default AppRouter