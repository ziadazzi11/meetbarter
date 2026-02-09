'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth(); // Assuming AuthContext provides token
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user && !socket) {
            // Initialize socket connection
            const newSocket = io(API_BASE_URL, {
                // auth: { token }, // TODO: Enable auth when backend verifies it
                transports: ['websocket'],
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            // eslint-disable-next-line
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else if (!user && socket) {
            // Disconnect if user logs out
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [user, socket]); // token will be needed here later

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
