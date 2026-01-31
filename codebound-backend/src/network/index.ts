import auth from "./routes/auth.route";
import sample from "./routes/sample.route";
import progress from "./routes/progress.route";
import leaderboard from "./routes/leaderboard.route";
import achievement from "./routes/achievement.route";
import community from "./routes/community.route";
import analytics from "./routes/analytics.route";
import gameSession from "./routes/gameSession.route";
import skin from "./routes/skin.route";
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

        // Sample & Authentication
        this.router.use("/sample", sample);
        this.router.use("/auth", auth);

        // Core Game Features
        this.router.use("/progress", progress);
        this.router.use("/leaderboard", leaderboard);
        this.router.use("/achievements", achievement);
        this.router.use("/sessions", gameSession);
        this.router.use("/skins", skin);

        // Community & Social
        this.router.use("/community", community);

        // Analytics & Metrics
        this.router.use("/analytics", analytics);
    }
}

export default AppRouter