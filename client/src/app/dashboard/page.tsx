'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, ArrowRight, ShieldAlert, BookOpen, Clock, Car, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DashboardHome() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-2xl mx-auto"
        >

            {/* Header */}
            <motion.div variants={itemVariants} className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-black text-onyx tracking-tight">
                        Hello, {user.display_name.split(' ')[0]}
                    </h1>
                    <p className="text-sm font-medium text-onyx-light">Welcome back to Autogaard</p>
                </div>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm relative group hover:scale-105 transition-transform">
                    <Bell size={20} className="text-onyx-light group-hover:text-onyx transition-colors" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-burgundy rounded-full border-2 border-white animate-pulse"></span>
                </button>
            </motion.div>

            {/* Wallet Snapshot */}
            <motion.div variants={itemVariants} className="bg-onyx text-white p-6 rounded-3xl shadow-xl shadow-onyx/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-white/10 transition-colors duration-700" />

                <h2 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Available Balance</h2>
                <div className="flex justify-between items-end relative z-10">
                    <p className="text-4xl font-black tracking-tight">
                        <span className="text-xl mr-1 align-top text-white/60">₦</span>
                        {Number(user.wallet_balance || 0).toLocaleString()}
                    </p>
                    <Link href="/dashboard/wallet" className="px-5 py-2.5 bg-white text-onyx text-xs font-bold rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all shadow-md">
                        Top Up
                    </Link>
                </div>
            </motion.div>

            {/* Quick Actions / Valuations */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <Link href="/valuation" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-burgundy/30 group transition-all flex flex-col justify-between min-h-[120px]">
                    <div className="w-10 h-10 rounded-full bg-burgundy/5 flex items-center justify-center mb-4 group-hover:bg-burgundy group-hover:scale-110 transition-all">
                        <Zap size={20} className="text-burgundy group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-onyx mb-1 group-hover:text-burgundy transition-colors">Instant Valuation</h3>
                        <p className="text-[9px] uppercase font-bold text-onyx-light tracking-widest">AI Pricing Engine</p>
                    </div>
                </Link>

                <Link href="/dashboard/garage" className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-onyx/30 group transition-all flex flex-col justify-between min-h-[120px]">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-onyx group-hover:scale-110 transition-all">
                        <Car size={20} className="text-onyx group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-onyx mb-1 group-hover:text-onyx transition-colors">My Garage</h3>
                        <p className="text-[9px] uppercase font-bold text-onyx-light tracking-widest">Saved Assets</p>
                    </div>
                </Link>
            </motion.div>

            {/* Active Engagements (Bids) Carousel Placeholders */}
            <motion.div variants={itemVariants}>
                <div className="flex justify-between items-end px-2 mb-4">
                    <h3 className="text-lg font-black text-onyx">Active Bids</h3>
                    <Link href="/dashboard/market" className="text-xs font-bold text-burgundy hover:underline">
                        View Auctions
                    </Link>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                    {/* Placeholder Active Bid 1 */}
                    <div className="min-w-[280px] bg-white border border-gray-50 rounded-2xl p-4 shadow-sm snap-center hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center">
                                <ShieldAlert size={12} className="mr-1" /> Outbid
                            </span>
                            <span className="flex items-center text-xs text-onyx-light font-bold">
                                <Clock size={12} className="mr-1" /> 2h 14m
                            </span>
                        </div>
                        <h4 className="font-bold text-onyx truncate">2018 Toyota Camry XLE</h4>
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-onyx-light tracking-wider">Current Bid</p>
                                <p className="font-black text-sm text-onyx">₦12,400,000</p>
                            </div>
                            <button className="px-3 py-1.5 bg-onyx text-white text-xs font-bold rounded-lg hover:bg-onyx/90 hover:scale-105 active:scale-95 transition-all">
                                Bid Again
                            </button>
                        </div>
                    </div>

                    {/* Empty State / CTA if no bids */}
                    <div className="min-w-[280px] bg-emerald/5 border border-emerald/10 rounded-2xl p-4 shadow-sm snap-center flex flex-col justify-center items-center text-center">
                        <Car className="text-emerald/50 mb-2" size={24} />
                        <h4 className="font-bold text-emerald text-sm">No other active bids</h4>
                        <p className="text-xs text-emerald/70 font-medium px-4 mt-1">Explore our marketplace to find your next premium vehicle.</p>
                    </div>
                </div>
            </motion.div>

            {/* The Concierge Block */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-burgundy/10 to-burgundy/5 border border-burgundy/10 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <h3 className="text-xl font-black text-burgundy mb-2 relative z-10">Autogaard Concierge</h3>
                <p className="text-sm font-medium text-onyx-light mb-4 relative z-10 max-w-[80%]">
                    Need expert advice? We help you inspect, value, and negotiate your next car.
                </p>
                <button className="flex items-center text-sm font-bold text-burgundy bg-white px-4 py-2 rounded-xl border border-burgundy/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all relative z-10">
                    Request Assistance <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            {/* Autogaard Insights (Blog feed placeholder) */}
            <motion.div variants={itemVariants} className="pt-2 pb-6">
                <div className="flex justify-between items-center px-2 mb-4">
                    <h3 className="text-lg font-black text-onyx flex items-center">
                        <BookOpen size={18} className="mr-2 text-burgundy scale-100 hover:scale-110 transition-transform" /> Autogaard Insights
                    </h3>
                </div>
                <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-200" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black tracking-widest uppercase text-burgundy">Market Report</span>
                            <h4 className="font-bold text-onyx text-sm leading-tight mt-0.5">Lagos Auto Market Trends: December 2025</h4>
                            <p className="text-xs text-onyx-light font-medium mt-1 uppercase tracking-widest">3 Min Read</p>
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-200" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald">Spotlight</span>
                            <h4 className="font-bold text-onyx text-sm leading-tight mt-0.5">Why the 'Foreign Used' premium is shrinking</h4>
                            <p className="text-xs text-onyx-light font-medium mt-1 uppercase tracking-widest">5 Min Read</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

        </motion.div>
    );
}
