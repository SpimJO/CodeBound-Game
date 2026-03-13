import { Router, Request, Response, NextFunction } from "express";
import problemController from "../controllers/problem.controller";
import { authMiddleware } from "@/middleware/auth";
import { apiKeyMiddleware } from "@/middleware/apiKey";

const router = Router();

// All problem routes require API key and authentication
router.use(apiKeyMiddleware, authMiddleware);

router
    .route("/:level")
    .get((req: Request, res: Response, next: NextFunction) =>
        problemController.getProblem(req, res, next)
    );

router
    .route("/")
    .get((req: Request, res: Response, next: NextFunction) =>
        problemController.getAllProblems(req, res, next)
    );

export default router;
