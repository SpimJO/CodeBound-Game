import appConfig from "@/config";
import { decryptKey } from "@/lib/apiKey";
import { HttpError } from "@/lib/error";
import { Request, Response, NextFunction } from "express";

const httpError = new HttpError();

const isPlainKey = (key: string): boolean => {
    try {
        const decoded = Buffer.from(key, "base64").toString("utf8");
        const parsed = JSON.parse(decoded);
        return typeof parsed === "object" && "iv" in parsed && "data" in parsed;
    } catch {
        return false;
    }
};

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = (req.headers["x-api-key"] || req.headers["api-key"]) as string | undefined;

    if (!key || typeof key !== "string") {
        next(httpError.unauthorized("Missing API key"));
        return;
    }

    try {
        let clientKey: string | null = null;
        let serverKey: string | null = null;

        if (isPlainKey(key)) {
            clientKey = decryptKey(key);
        }
        if (!clientKey) {
            clientKey = key.trim();
        }

        if (isPlainKey(appConfig.API_KEY)) {
            serverKey = decryptKey(appConfig.API_KEY);
        }
        if (!serverKey) {
            serverKey = appConfig.API_KEY.trim();
        }

        if (clientKey && serverKey && clientKey === serverKey) {
            next();
            return;
        }

        next(httpError.unauthorized("You do not have access to this api"));
    } catch {
        next(httpError.unauthorized("You do not have access to this api"));
    }
};