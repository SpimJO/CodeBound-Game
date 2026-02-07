/**
 * API Error Interface
 * Represents error structure returned by backend
 */
export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * HTTP Error Interface
 * Represents error from HTTP client (xior/axios)
 */
export interface HttpError extends Error {
    response?: {
        data?: ApiError;
        status?: number;
    };
    message: string;
}

/**
 * Helper function to extract error message
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        const httpError = error as HttpError;
        return httpError.response?.data?.message || httpError.message;
    }

    return 'An unexpected error occurred';
}
