'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, ArrowRight, ShieldAlert, BookOpen, Clock, Car } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-black text-onyx tracking-tight">
                        Hello, {user.display_name.split(' ')[0]}
                    </h1>
                    <p className="text-sm font-medium text-onyx-light">Welcome back to Autogaard</p>
                </div>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm relative group">
                    <Bell size={20} className="text-onyx-light group-hover:text-onyx" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-burgundy rounded-full border-2 border-white"></span>
                </button>
            </div>

            {/* Wallet Snapshot */}
            <div className="bg-onyx text-white p-6 rounded-3xl shadow-xl shadow-onyx/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                <h2 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Available Balance</h2>
                <div className="flex justify-between items-end">
                    <p className="text-4xl font-black tracking-tight">
                        <span className="text-xl mr-1 align-top text-white/60">₦</span>
                        {Number(user.wallet_balance || 0).toLocaleString()}
                    </p>
                    <Link href="/dashboard/wallet" className="px-5 py-2.5 bg-white text-onyx text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">
                        Top Up
                    </Link>
                </div>
            </div>

            {/* Active Engagements (Bids) Carousel Placeholders */}
            <div>
                <div className="flex justify-between items-end px-2 mb-4">
                    <h3 className="text-lg font-black text-onyx">Active Bids</h3>
                    <Link href="/dashboard/market" className="text-xs font-bold text-burgundy hover:underline">
                        View Auctions
                    </Link>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                    {/* Placeholder Active Bid 1 */}
                    <div className="min-w-[280px] bg-white border border-gray-50 rounded-2xl p-4 shadow-sm snap-center">
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
                            <button className="px-3 py-1.5 bg-onyx text-white text-xs font-bold rounded-lg hover:bg-onyx/90">
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
            </div>

            {/* The Concierge Block */}
            <div className="bg-gradient-to-br from-burgundy/10 to-burgundy/5 border border-burgundy/10 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                <h3 className="text-xl font-black text-burgundy mb-2 relative z-10">Autogaard Concierge</h3>
                <p className="text-sm font-medium text-onyx-light mb-4 relative z-10 max-w-[80%]">
                    Need expert advice? We help you inspect, value, and negotiate your next car.
                </p>
                <button className="flex items-center text-sm font-bold text-burgundy bg-white px-4 py-2 rounded-xl border border-burgundy/10 hover:shadow-sm transition-all relative z-10">
                    Request Assistance <ArrowRight size={16} className="ml-2" />
                </button>
            </div>

            {/* Autogaard Insights (Blog feed placeholder) */}
            <div className="pt-2">
                <div className="flex justify-between items-center px-2 mb-4">
                    <h3 className="text-lg font-black text-onyx flex items-center">
                        <BookOpen size={18} className="mr-2 text-burgundy" /> Autogaard Insights
                    </h3>
                </div>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-200" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black tracking-widest uppercase text-burgundy">Market Report</span>
                            <h4 className="font-bold text-onyx text-sm leading-tight mt-0.5">Lagos Auto Market Trends: December 2025</h4>
                            <p className="text-xs text-onyx-light font-medium mt-1 uppercase tracking-widest">3 Min Read</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-200" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald">Spotlight</span>
                            <h4 className="font-bold text-onyx text-sm leading-tight mt-0.5">Why the 'Foreign Used' premium is shrinking</h4>
                            <p className="text-xs text-onyx-light font-medium mt-1 uppercase tracking-widest">5 Min Read</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
