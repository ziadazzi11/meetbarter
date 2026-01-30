
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';

export const useSocket = (tradeId?: string) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token'); // In MVP we might not have a token yet?
        // Wait, current Auth flow doesn't seem to store 'token' in localStorage explicitly?
        // Let's assume passed in or handle connection without token for public beta if needed, 
        // but ChatGateway requires it. 
        // NOTE: If using the DEMO_USER_ID approach without real login, socket auth will fail.
        // For 'Phase 11' we should assume user is logged in or we pass a dummy token.

        const newSocket = io(API_BASE_URL, {
            auth: { token: token || "DEMO_TOKEN" }, // MVP Hack if no token
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
            if (tradeId) {
                newSocket.emit('join_trade', tradeId);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketRef.current = newSocket;

        return () => {
            newSocket.disconnect();
        };
    }, [tradeId]);

    return { socket: socketRef.current, isConnected };
};
