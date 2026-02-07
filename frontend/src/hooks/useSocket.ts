
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';

export const useSocket = (tradeId?: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // ... (auth logic)
        const token = localStorage.getItem('token');

        const newSocket = io(API_BASE_URL, {
            auth: { token: token || "DEMO_TOKEN" },
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

        // eslint-disable-next-line
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [tradeId]);

    return { socket, isConnected };
};
