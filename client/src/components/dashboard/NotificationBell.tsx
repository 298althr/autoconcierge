'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-burgundy text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]"
                    >
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-heading font-extrabold text-slate-900">Notifications</h3>
                            <button
                                className="text-xs text-slate-400 hover:text-burgundy transition-colors font-bold uppercase tracking-wider"
                                onClick={() => notifications.forEach(n => !n.is_read && markAsRead(n.id))}
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50 relative group ${!notification.is_read ? 'bg-burgundy/5' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.is_read ? 'bg-burgundy' : 'bg-transparent'}`} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-2">{notification.message}</p>

                                                <div className="flex items-center gap-3">
                                                    {notification.link && (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => setIsOpen(false)}
                                                            className="text-[10px] font-bold text-burgundy uppercase tracking-widest flex items-center gap-1 hover:underline"
                                                        >
                                                            Action <ExternalLink size={10} />
                                                        </Link>
                                                    )}
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-slate-600"
                                                        >
                                                            Dismiss <Check size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-sm text-slate-400 font-subheading">All caught up!</p>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/dashboard/notifications"
                            className="block p-3 text-center text-xs font-bold text-slate-400 hover:text-burgundy bg-slate-50 transition-colors uppercase tracking-widest"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
