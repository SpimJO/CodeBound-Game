/**
 * Rate Limiter Middleware
 * ----------------------
 * This middleware provides protection against brute force attacks and abuse
 * by limiting the number of requests a single IP can make within a time window.
 * 
 * Uses in-memory store for rate limiting (suitable for single-instance deployments).
 * 
 * Usage:
 * 1. Global rate limiting:
 *    ```
 *    // In your server.ts or app.ts
 *    const globalRateLimiter = createRateLimiterMiddleware();
 *    app.use(globalRateLimiter);
 *    ```
 * 
 * 2. Route-specific rate limiting:
 *    ```
 *    // For authentication routes with stricter limits
 *    const authLimiter = createAuthRateLimiterMiddleware();
 *    app.post('/login', authLimiter, loginController);
 *    ```
 */
import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Only apply rate limiting in production environment
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns boolean indicating whether to skip rate limiting
 */
export const shouldRateLimit = (req: Request, res: Response): boolean => {
    if (process.env.NODE_ENV !== 'production') {
        return false;
    }

    return true;
};

/**
 * Standard rate limiter options for general API routes
 */
export const standardRateLimiterOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 429,
        message: 'Too many requests, please try again later.'
    },
    skip: (req: Request, res: Response) => !shouldRateLimit(req, res),
};

/**
 * Creates and returns a configured rate limiter middleware with in-memory store
 * 
 * Usage example:
 * ```
 * // In your Express app setup
 * const limiter = createRateLimiterMiddleware();
 * app.use(limiter);
 * ```
 * 
 * @returns Configured Express rate limiter middleware
 */
export const createRateLimiterMiddleware = () => {
    return rateLimit(standardRateLimiterOptions);
};

/**
 * Basic in-memory rate limiter middleware for quick usage
 * 
 * Usage: app.use(basicRateLimiterMiddleware);
 */
export const basicRateLimiterMiddleware = rateLimit(standardRateLimiterOptions);

/**
 * Auth rate limiter configuration options for sensitive routes
 * More restrictive than the standard rate limiter
 */
export const authRateLimiterOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many login attempts, please try again later.',
    },
    skip: (req: Request) => process.env.NODE_ENV !== 'production',
};

/**
 * Creates and returns a stricter rate limiter for auth-related endpoints
 * This provides better protection against brute force login attempts
 * 
 * Usage example:
 * ```
 * // In your auth routes setup
 * const authLimiter = createAuthRateLimiterMiddleware();
 * router.post('/login', authLimiter, loginController);
 * ```
 * 
 * @returns Configured strict rate limiter middleware
 */
export const createAuthRateLimiterMiddleware = () => {
    return rateLimit(authRateLimiterOptions);
};
