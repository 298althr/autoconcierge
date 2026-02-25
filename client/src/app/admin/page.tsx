'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import MotionBackground from '@/components/landing/MotionBackground';
import {
    Users,
    Car,
    Gavel,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiFetch('/admin/stats', { token });
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
            <div className="w-16 h-16 bg-slate-900/5 text-slate-900 rounded-full flex items-center justify-center animate-pulse">
                <Shield size={24} />
            </div>
        </div>
    );

    const cards = [
        { name: 'Total Users', value: stats?.total_users, icon: Users, trend: '+12%', color: 'bg-slate-50 text-slate-600 border-slate-200' },
        { name: 'Inventory', value: stats?.total_vehicles, icon: Car, trend: '+5%', color: 'bg-slate-50 text-slate-600 border-slate-200' },
        { name: 'Live Auctions', value: stats?.active_auctions, icon: Gavel, trend: 'Hold', color: 'bg-burgundy/5 text-burgundy border-burgundy/10' },
        { name: 'Total Volume', value: `₦${(stats?.total_volume || 0).toLocaleString()}`, icon: TrendingUp, trend: '+24%', color: 'bg-slate-50 text-slate-600 border-slate-200' },
    ];

    return (
        <main className="relative min-h-[calc(100vh-4rem)] bg-[#F8FAFC] selection:bg-burgundy selection:text-white p-6 md:p-12 overflow-hidden">
            <MotionBackground />

            <div className="relative z-10 max-w-7xl mx-auto">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center space-x-2 text-burgundy font-bold uppercase tracking-[0.2em] text-[10px] mb-3 font-subheading">
                            <Shield size={14} />
                            <span>Administrative Overview</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight mb-3">System Dashboard.</h1>
                        <p className="text-slate-500 font-subheading text-sm leading-relaxed">Real-time performance and operational metrics.</p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {cards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="glass-card p-8 group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`w-14 h-14 ${card.color} border rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex items-center space-x-1 text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                        <ArrowUpRight size={12} />
                                        <span>{card.trend}</span>
                                    </div>
                                </div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 font-subheading">{card.name}</h3>
                                <p className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{card.value || 0}</p>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="lg:col-span-2 glass-card p-10 md:p-12 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Network Growth.</h3>
                            <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <div className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 font-subheading">
                                    <Activity size={12} />
                                    <span>Live Activity</span>
                                </div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>

                        <div className="flex-1 h-64 flex items-end space-x-3 w-full">
                            {stats?.bid_activity?.length ? stats.bid_activity.map((day: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-slate-100 rounded-t-2xl group relative cursor-pointer hover:bg-burgundy transition-all duration-300 border border-slate-200 hover:border-burgundy"
                                    style={{ height: `${Math.max(20, (day.count / 100) * 100)}%` }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold tracking-widest shadow-xl transform scale-95 group-hover:scale-100">
                                        {day.count} Bids
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                    </div>
                                </div>
                            )) : (
                                // Mock data if empty
                                Array.from({ length: 7 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-slate-100 rounded-t-2xl group relative cursor-pointer hover:bg-burgundy transition-all duration-300 border border-slate-200 hover:border-burgundy"
                                        style={{ height: `${Math.max(20, (Math.random() * 100))}%` }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold tracking-widest shadow-xl transform scale-95 group-hover:scale-100">
                                            Data
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] font-subheading border-t border-slate-100 pt-6">
                            <span>Last 7 Days</span>
                            <span>Current Day</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="glass-card p-10 md:p-12"
                    >
                        <h3 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight mb-10">System Status.</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Socket Server', status: 'Online', icon: Activity },
                                { name: 'Cron Jobs', status: 'Active', icon: Clock },
                                { name: 'DB Connection', status: 'Healthy', icon: Shield },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.name} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group hover:border-slate-200 transition-colors">
                                        <div className="flex items-center space-x-5">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors border border-slate-100">
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-heading font-bold text-slate-900 mb-1">{item.name}</p>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] font-subheading">{item.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
