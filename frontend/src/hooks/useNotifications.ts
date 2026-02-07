import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';
import { useToast } from '@/context/ToastContext';

interface NotificationEvent {
    type: 'NEW_MESSAGE' | 'CASH_PROPOSED' | 'TRADE_COMPLETED' | 'TRADE_CONFIRMED_PARTIAL' | 'INTENT_RECORDED' | 'MEETUP_AGREED';
    payload: Record<string, unknown>; // Flexible payload
}

export const useNotifications = (userId: string) => {
    const socketRef = useRef<Socket | null>(null);
    const [lastNotification, setLastNotification] = useState<NotificationEvent | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (!userId) return;

        // Connect to /notifications namespace
        const newSocket = io(`${API_BASE_URL}/notifications`, {
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Notifications Socket connected');
            newSocket.emit('join_user', userId);
        });

        newSocket.on('notification', (data) => {
            console.log('New Notification:', data);
            setLastNotification(data);

            // Premium Toast Notifications
            switch (data.type) {
                case 'NEW_MESSAGE':
                    showToast(`💬 ${data.payload.content.substring(0, 40)}${data.payload.content.length > 40 ? '...' : ''}`, 'INFO');
                    break;
                case 'CASH_PROPOSED':
                    showToast(`💰 New Cash Offer: ${data.payload.amount} ${data.payload.currency}`, 'SUCCESS');
                    break;
                case 'TRADE_COMPLETED':
                    showToast(`🎉 ${data.payload.title}`, 'SUCCESS');
                    break;
                case 'TRADE_CONFIRMED_PARTIAL':
                    showToast(`🤝 Confirmed by ${data.payload.by}`, 'INFO');
                    break;
                case 'INTENT_RECORDED':
                    showToast(`📌 ${data.payload.message}`, 'INFO');
                    break;
                case 'MEETUP_AGREED':
                    showToast(`📍 ${data.payload.message}`, 'SUCCESS');
                    break;
                default:
                    showToast(`🔔 New notification received`, 'INFO');
            }
        });

        socketRef.current = newSocket;

        return () => {
            newSocket.disconnect();
        };
    }, [userId, showToast]);

    return { lastNotification };
};
