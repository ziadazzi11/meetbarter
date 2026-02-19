'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadNotifications: number;
    unreadMessages: number;
    markNotificationsRead: () => void;
    markMessagesRead: () => void;
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
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const markNotificationsRead = () => setUnreadNotifications(0);
    const markMessagesRead = () => setUnreadMessages(0);

    useEffect(() => {
        if (user && !socket) {
            // Initialize socket connection
            const token = localStorage.getItem('meetbarter_token');
            const newSocket = io(API_BASE_URL, {
                auth: { token },
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]); // Depend on user ID, not the object reference

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            unreadNotifications,
            unreadMessages,
            markNotificationsRead,
            markMessagesRead
        }}>
            {children}
        </SocketContext.Provider>
    );
};
