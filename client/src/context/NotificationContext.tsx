'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { apiFetch } from '@/lib/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    metadata?: any;
}

interface NotificationContextProps {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuth();
    const { socket, authenticate, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const [notifRes, countRes] = await Promise.all([
                apiFetch('/me/notifications', { token }),
                apiFetch('/me/notifications/unread-count', { token })
            ]);
            setNotifications(notifRes.data || []);
            setUnreadCount(countRes.count || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [token]);

    const markAsRead = async (id: string) => {
        if (!token) return;
        try {
            await apiFetch(`/me/notifications/${id}/read`, {
                method: 'PATCH',
                token
            });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token, fetchNotifications]);

    // Socket authentication
    useEffect(() => {
        if (isConnected && token) {
            authenticate(token);
        }
    }, [isConnected, token, authenticate]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optionally play sound or show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, { body: notification.message });
            }
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
