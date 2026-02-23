'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
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
        <div className="h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        </div>
    );

    const cards = [
        { name: 'Total Users', value: stats?.total_users, icon: Users, trend: '+12%', color: 'bg-blue-50 text-blue-600' },
        { name: 'Inventory', value: stats?.total_vehicles, icon: Car, trend: '+5%', color: 'bg-emerald-50 text-emerald-600' },
        { name: 'Live Auctions', value: stats?.active_auctions, icon: Gavel, trend: 'Hold', color: 'bg-burgundy/5 text-burgundy' },
        { name: 'Total Volume', value: `₦${(stats?.total_volume || 0).toLocaleString()}`, icon: TrendingUp, trend: '+24%', color: 'bg-orange-50 text-orange-600' },
    ];

    return (
        <main className="p-12">
            <header className="mb-12">
                <div className="flex items-center space-x-2 text-burgundy font-black uppercase tracking-widest text-[10px] mb-2">
                    <Shield size={14} />
                    <span>Administrative Overview</span>
                </div>
                <h1 className="text-4xl font-black text-onyx">System Dashboard</h1>
                <p className="text-onyx-light font-medium">Real-time performance and operational metrics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-onyx/5 transition-all"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex items-center space-x-1 text-[10px] font-black text-emerald uppercase tracking-widest">
                                    <ArrowUpRight size={14} />
                                    <span>{card.trend}</span>
                                </div>
                            </div>
                            <h3 className="text-xs font-black text-onyx-light uppercase tracking-widest mb-1">{card.name}</h3>
                            <p className="text-3xl font-black text-onyx">{card.value || 0}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed mockup */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-onyx">Network Growth</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-onyx-light">
                                <Activity size={14} />
                                <span>Live Activity</span>
                            </div>
                            <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
                        </div>
                    </div>

                    <div className="h-64 flex items-end space-x-2">
                        {stats?.bid_activity?.map((day: any, i: number) => (
                            <div
                                key={i}
                                className="flex-1 bg-burgundy/10 rounded-t-xl group relative cursor-pointer hover:bg-burgundy transition-colors"
                                style={{ height: `${Math.max(20, (day.count / 100) * 100)}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-onyx text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {day.count} Bids
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black text-onyx-light uppercase tracking-widest">
                        <span>Last 7 Days</span>
                        <span>Current Day</span>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-onyx mb-8">System Status</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Socket Server', status: 'Online', icon: Activity },
                            { name: 'Cron Jobs', status: 'Active', icon: Clock },
                            { name: 'DB Connection', status: 'Healthy', icon: Shield },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.name} className="flex items-center justify-between p-4 bg-canvas rounded-2xl border border-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-onyx">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-onyx">{item.name}</p>
                                            <p className="text-[10px] font-bold text-emerald uppercase tracking-widest">{item.status}</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 bg-emerald rounded-full" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
