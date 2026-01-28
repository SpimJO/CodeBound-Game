// filepath: e:\Dev\GITHUB\CLOSESOURCE\backend-boilerplate\chy-node-be-boilerplate\src\middleware\securityHeaders.ts
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import nocache from 'nocache';

/**
 * Comprehensive security headers middleware optimized for production environment.
 * This implementation uses helmet.js with additional custom security headers.
 * 
 * Security features:
 * - Content-Security-Policy: Helps prevent XSS attacks
 * - Strict-Transport-Security: Forces HTTPS
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - X-Frame-Options: Prevents clickjacking
 * - X-XSS-Protection: Additional XSS protection
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Controls browser features
 * - Cache-Control: Prevents sensitive information caching
 */

export const securityHeaders = () => {
  const middlewares = [
    // Core helmet protection with CSP
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Modify as needed for your app
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      // Strong HSTS for production - 1 year in seconds
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Prevent framing of the site
      xFrameOptions: { action: "deny" },
      // Prevent MIME type sniffing
      noSniff: true,
      // Turn on the browser's built-in XSS protection
      xssFilter: true,
      // Controls how much referrer information should be included with requests
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),

    // Prevent browsers from caching sensitive information
    nocache(),

    // Add modern Permissions-Policy (replacement for Feature-Policy)
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=(), magnetometer=(), gyroscope=(), payment=()"
      );
      next();
    },

    // Add Cross-Origin headers
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
      next();
    },
  ];

  // Return a middleware that applies all security middlewares in sequence
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply each middleware in sequence
    let currentMiddlewareIndex = 0;
    
    const executeNextMiddleware = () => {
      if (currentMiddlewareIndex < middlewares.length) {
        const currentMiddleware = middlewares[currentMiddlewareIndex];
        currentMiddlewareIndex++;
        currentMiddleware(req, res, executeNextMiddleware);
      } else {
        next();
      }
    };

    executeNextMiddleware();
  };
};

// Export a production-ready configuration that's ready to use
export default securityHeaders;