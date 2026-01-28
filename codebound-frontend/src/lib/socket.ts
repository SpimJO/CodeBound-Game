import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(import.meta.env.VITE_BACKEND_WS_BASE_URL, {
    autoConnect: false, // Handle the connection manually
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false, // Do not reuse existing connections
    transports: ['websocket']
});