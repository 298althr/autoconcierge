'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Check,
    ChevronRight,
    Filter,
    Calendar,
    Clock,
    Trash2,
    ArrowLeft,
    CheckCircle2,
    Info,
    AlertTriangle,
    Zap,
    Scale,
    Gavel,
    ShieldCheck,
    Wrench,
    Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const getIcon = (type: string) => {
    switch (type) {
        case 'auction_won':
        case 'auction_bid':
            return <Gavel size={18} className="text-burgundy" />;
        case 'escrow_update':
            return <ShieldCheck size={18} className="text-emerald-500" />;
        case 'workshop_update':
            return <Wrench size={18} className="text-blue-500" />;
        case 'wallet_update':
            return <Wallet size={18} className="text-yellow-600" />;
        case 'concierge_update':
            return <Zap size={18} className="text-purple-500" />;
        default:
            return <Bell size={18} className="text-slate-400" />;
    }
};

const getBgColor = (type: string) => {
    switch (type) {
        case 'auction_won': return 'bg-burgundy/5';
        case 'escrow_update': return 'bg-emerald-50';
        case 'workshop_update': return 'bg-blue-50';
        case 'wallet_update': return 'bg-yellow-50';
        case 'concierge_update': return 'bg-purple-50';
        default: return 'bg-slate-50';
    }
};

export default function NotificationsPage() {
    const { notifications, markAsRead, unreadCount, fetchNotifications } = useNotifications();
    const { token } = useAuth();
    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        return n.type.startsWith(filter);
    });

    return (
        <main className="relative min-h-screen bg-canvas selection:bg-burgundy selection:text-white pb-32 pt-24 md:pt-32">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link
                            href="/dashboard"
                            className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] mb-4 transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Dashboard Matrix</span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                            Dossier Hub
                            {unreadCount > 0 && (
                                <span className="bg-burgundy text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                                    {unreadCount} UNREAD
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                            Chronological history of all protocol states, transactions, and vehicle lifecycle events.
                        </p>
                    </div>

                    <div className="flex bg-white/60 backdrop-blur-sm p-1 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto overflow-x-auto no-scrollbar">
                        {['all', 'unread', 'auction', 'escrow', 'workshop', 'wallet'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === tab
                                        ? 'bg-slate-900 text-white shadow-lg shadow-black/10'
                                        : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                <section className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n, index) => (
                                <motion.div
                                    key={n.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`glass-card p-6 md:p-8 flex items-start gap-4 md:gap-6 group transition-all duration-500 relative overflow-hidden ${!n.is_read ? 'border-l-4 border-l-burgundy shadow-xl shadow-burgundy/5 bg-white' : 'border-l-4 border-l-transparent bg-white/40 grayscale-[0.5] opacity-80'
                                        }`}
                                >
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${getBgColor(n.type)}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-sm md:text-base font-heading font-extrabold text-slate-900 leading-tight uppercase tracking-tight">
                                                {n.title}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </span>
                                        </div>

                                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium mb-4">
                                            {n.message}
                                        </p>

                                        <div className="flex items-center gap-4">
                                            {n.link && (
                                                <Link
                                                    href={n.link}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-burgundy hover:gap-3 transition-all"
                                                >
                                                    Deploy Context <ChevronRight size={12} />
                                                </Link>
                                            )}
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:gap-3 transition-all"
                                                >
                                                    Mark Read <Check size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!n.is_read && (
                                        <div className="absolute top-4 right-4 md:top-8 md:right-8 w-2 h-2 bg-burgundy rounded-full shadow-[0_0_10px_#800000]" />
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 text-center"
                            >
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <Bell size={32} />
                                </div>
                                <h2 className="text-xl md:text-2xl font-heading font-bold text-slate-900 mb-2">Matrix Silence.</h2>
                                <p className="text-sm md:text-base text-slate-500 font-subheading">No protocol events matched your current filter criteria.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </main>
    );
}
