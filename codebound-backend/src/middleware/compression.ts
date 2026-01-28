import compression from 'compression';
import { Request, Response } from 'express';

/**
 * Only compress responses for requests that match specific criteria
 * - Skip compression for small responses (under 1KB)
 * - Skip compression for requests from localhost/development environments
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns boolean indicating whether to compress the response
 */
export const shouldCompress = (req: Request, res: Response): boolean => {
    if (req.headers['x-no-compression']) {
        return false;
    }

    if (process.env.NODE_ENV !== 'production') {
        return false;
    }

    return true;
};

/**
 * Compression middleware options for production use
 * 
 * - level: 6 provides a good balance between compression ratio and CPU usage
 * - threshold: Only compress responses larger than 1KB (1024 bytes)
 * - filter: Custom function to determine which responses should be compressed
 */
export const compressionOptions = {
    level: 6, // Default is 6, ranges from 0 (no compression) to 9 (max compression)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: shouldCompress,
    // Enable Brotli compression when available (better than gzip)
    // Note: Brotli is only used if the client supports it via Accept-Encoding header
    brotli: {
        params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4
        }
    }
};

/**
 * Configured compression middleware ready for use in the application
 * 
 * Usage: app.use(compressionMiddleware);
 */
export const compressionMiddleware = compression(compressionOptions);