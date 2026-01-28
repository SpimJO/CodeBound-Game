import { authMiddleware } from "@/middleware/auth";
import { apiKeyMiddleware } from "@/middleware/apiKey";
import SampleController from "../controllers/sample.controller";
import { Response, Request, NextFunction, Router } from "express";

const sample: Router = Router();
const sampleController = new SampleController();

sample.route("/").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => sampleController.sampleRoute(req, res, next));

export default sample;
