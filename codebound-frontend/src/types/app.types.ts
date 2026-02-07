import { z } from 'zod';
import { socket } from '@/lib/socket';
import type { ReactNode } from 'react'

export interface SocketData {
    [key: string]: unknown;
}

export type WSContextType = {
    socket: typeof socket;
    isConnected: boolean;
    connectionError: string | null;
    emit: (event: string, data?: SocketData) => void;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    off: (event: string, callback?: (...args: unknown[]) => void) => void;
    connect: () => void;
    disconnect: () => void;
    forceReconnect: () => void;
}

export type WSProviderType = {
    children: ReactNode;
    autoConnect?: boolean;
}

// NOTE: Use this schema to validate API error responses
export const ApiErrorResponseSchema = z.object({
    message: z.string(),
    error: z.object({
        statusCode: z.number(),
        rawErrors: z.array(z.string()),
    }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

