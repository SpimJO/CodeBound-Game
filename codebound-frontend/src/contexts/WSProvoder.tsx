import { socket } from '@/lib/socket';
import type { WSContextType, WSProviderType } from '@/types/app.types';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WSContext = createContext<WSContextType | null>(null);

const WSProvider = ({
    children,
    autoConnect = true
}: WSProviderType) => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const connect = useCallback(() => {
        if (socket.connected) return;

        if (!import.meta.env.VITE_BACKEND_WS_BASE_URL) {
            console.error('WS URL not configured');
            return;
        }

        socket.connect();
    }, []);

    const disconnect = useCallback(() => {
        socket.disconnect();
    }, []);

    const forceReconnect = useCallback(() => {
        disconnect();
        connect();
    }, [disconnect, connect]);

    const emit = useCallback((event: string, data?: any) => {
        if (!socket.connected) {
            console.warn('Cannot emit: socket not connected');
            return;
        }

        socket.emit(event, data);
    }, []);

    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        socket.on(event, callback);
    }, []);

    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        socket.off(event, callback);
    }, []);

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
            setConnectionError(null);
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const onConnectError = (error: any) => {
            setConnectionError(error.message);
            setIsConnected(false);
        };

        const onReconnect = () => {
            setIsConnected(true);
            setConnectionError(null);
        };

        const onReconnectError = (error: any) => {
            setConnectionError(error.message);
        };

        const onReconnectFailed = () => {
            setConnectionError('Failed to reconnect');
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('reconnect', onReconnect);
        socket.on('reconnect_error', onReconnectError);
        socket.on('reconnect_failed', onReconnectFailed);

        if (autoConnect && import.meta.env.VITE_BACKEND_WS_BASE_URL) {
            connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('reconnect', onReconnect);
            socket.off('reconnect_error', onReconnectError);
            socket.off('reconnect_failed', onReconnectFailed);
        };
    }, [autoConnect, connect]);

    useEffect(() => {
        const handleFocus = () => {
            if (!isConnected && !socket.connected) {
                connect();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isConnected, connect]);

    const contextValue: WSContextType = {
        socket,
        isConnected,
        connectionError,
        emit,
        on,
        off,
        connect,
        disconnect,
        forceReconnect
    };

    return (
        <WSContext.Provider value={contextValue}>
            {children}
        </WSContext.Provider>
    );
};

export const useWS = (): WSContextType => {
    const context = useContext(WSContext);
    if (!context) {
        throw new Error('useWS must be used within a WSProvider');
    }
    return context;
}

export default WSProvider;