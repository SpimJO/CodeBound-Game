import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/error';

const httpError = new HttpError();

/**
 * Validate UUID format
 */
export const validateUUID = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.params[paramName];
        
        if (!value) {
            return next(httpError.badRequest(`Missing parameter: ${paramName}`));
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!uuidRegex.test(value)) {
            return next(httpError.badRequest(`Invalid UUID format for ${paramName}`));
        }

        next();
    };
};

/**
 * Validate numeric parameter is within range
 */
export const validateRange = (paramName: string, min: number, max: number, isQuery = false) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = isQuery ? req.query[paramName] : req.params[paramName];
        
        if (!value) {
            return next(); // Optional parameter
        }

        const numValue = parseInt(value as string, 10);

        if (isNaN(numValue)) {
            return next(httpError.badRequest(`${paramName} must be a number`));
        }

        if (numValue < min || numValue > max) {
            return next(httpError.badRequest(`${paramName} must be between ${min} and ${max}`));
        }

        // Attach validated value to request
        if (isQuery) {
            req.query[paramName] = numValue.toString();
        } else {
            req.params[paramName] = numValue.toString();
        }

        next();
    };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    if (isNaN(limit) || limit < 1 || limit > 100) {
        return next(httpError.badRequest('limit must be between 1 and 100'));
    }

    if (isNaN(offset) || offset < 0) {
        return next(httpError.badRequest('offset must be 0 or greater'));
    }

    req.query.limit = limit.toString();
    req.query.offset = offset.toString();

    next();
};

/**
 * Validate level number
 */
export const validateLevel = (req: Request, res: Response, next: NextFunction): void => {
    const level = parseInt(req.body.levelCompleted || req.query.level as string, 10);

    if (!level) {
        return next(); // Optional
    }

    if (isNaN(level) || level < 1 || level > 100) {
        return next(httpError.badRequest('level must be between 1 and 100'));
    }

    next();
};
