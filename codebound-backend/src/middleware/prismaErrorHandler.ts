import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/error';

const httpError = new HttpError();

/**
 * Prisma error handler middleware
 * Converts Prisma errors to HTTP errors
 */
export const prismaErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Not a Prisma error, pass to next error handler
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) && 
        !(error instanceof Prisma.PrismaClientUnknownRequestError) &&
        !(error instanceof Prisma.PrismaClientValidationError) &&
        !(error instanceof Prisma.PrismaClientInitializationError)) {
        return next(error);
    }

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                // Unique constraint violation
                const target = (error.meta?.target as string[]) || ['field'];
                return next(httpError.conflict(`A record with this ${target.join(', ')} already exists`));

            case 'P2003':
                // Foreign key constraint violation
                return next(httpError.badRequest('Related record does not exist'));

            case 'P2025':
                // Record not found
                return next(httpError.notFound('Record not found'));

            case 'P2014':
                // Relation violation
                return next(httpError.badRequest('Invalid relation: referenced record does not exist'));

            case 'P2016':
                // Query interpretation error
                return next(httpError.badRequest('Invalid query parameters'));

            case 'P2021':
                // Table does not exist
                return next(httpError.internalServerError('Database schema error: table does not exist'));

            case 'P2022':
                // Column does not exist
                return next(httpError.internalServerError('Database schema error: column does not exist'));

            default:
                return next(httpError.internalServerError(`Database error: ${error.message}`));
        }
    }

    // Handle validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        return next(httpError.badRequest('Invalid data provided'));
    }

    // Handle initialization errors (connection issues)
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return next(httpError.internalServerError('Database connection error'));
    }

    // Handle unknown Prisma errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return next(httpError.internalServerError('An unexpected database error occurred'));
    }

    // Fallback
    next(error);
};
