/**
 * Rate Limiter Middleware
 * ----------------------
 * This middleware provides protection against brute force attacks and abuse
 * by limiting the number of requests a single IP can make within a time window.
 * 
 * For production environments, it uses Redis as a distributed store,
 * allowing rate limiting to work across multiple server instances.
 * 
 * Usage:
 * 1. Global rate limiting:
 *    ```
 *    // In your server.ts or app.ts
 *    const globalRateLimiter = await createRateLimiterMiddleware();
 *    app.use(globalRateLimiter);
 *    ```
 * 
 * 2. Route-specific rate limiting:
 *    ```
 *    // For authentication routes with stricter limits
 *    const authLimiter = await createAuthRateLimiterMiddleware();
 *    app.post('/login', authLimiter, loginController);
 *    ```
 */
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis, { connectRedis } from '../db/redis';
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
 * Base rate limiter configuration
 * Uses Redis as a store for distributed rate limiting across multiple server instances
 */
const createRedisStore = async () => {
    await connectRedis();

    return new RedisStore({
        sendCommand: (...args: unknown[]) => redis.sendCommand(args as any),
        prefix: 'rate-limit:',
    });
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
 * Initializes and returns a configured rate limiter middleware with Redis store
 * for distributed rate limiting in production environments
 * 
 * Usage example:
 * ```
 * // In your Express app setup
 * async function setupMiddleware() {
 *   const limiter = await createRateLimiterMiddleware();
 *   app.use(limiter);
 * }
 * ```
 * 
 * @returns Promise resolving to configured Express rate limiter middleware
 */
export const createRateLimiterMiddleware = async () => {
    await connectRedis();

    return rateLimit({
        ...standardRateLimiterOptions,
        store: new RedisStore({
            sendCommand: (...args: unknown[]) => redis.sendCommand(args as any),
            prefix: 'rate-limit:',
        })
    });
};

/**
 * Basic in-memory rate limiter middleware for quick usage
 * NOTE: This should be used only for local development or testing
 * For production, use createRateLimiterMiddleware() instead
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
 * Initializes and returns a stricter rate limiter for auth-related endpoints
 * This provides better protection against brute force login attempts
 * 
 * Usage example:
 * ```
 * // In your auth routes setup
 * async function setupAuthRoutes() {
 *   const authLimiter = await createAuthRateLimiterMiddleware();
 *   router.post('/login', authLimiter, loginController);
 * }
 * ```
 * 
 * @returns Promise resolving to configured strict rate limiter middleware
 */
export const createAuthRateLimiterMiddleware = async () => {
    await connectRedis();

    return rateLimit({
        ...authRateLimiterOptions,
        store: new RedisStore({
            sendCommand: (...args: unknown[]) => redis.sendCommand(args as any),
            prefix: 'auth-rate-limit:',
        }),
    });
};