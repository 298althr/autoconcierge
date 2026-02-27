'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Warehouse,
    Plus,
    ArrowRight,
    Car,
    Activity,
    Tag,
    Clock,
    ShieldCheck,
    ShoppingBag,
    Wrench,
    MapPin,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGarage, useSales } from '@/hooks/useGarage';
import WorkshopHubs from '@/components/garage/WorkshopHubs';
import MotionBackground from '@/components/landing/MotionBackground';

export default function GaragePage() {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'vault' | 'workshop' | 'sales'>('vault');

    const { vehicles, loading: garageLoading } = useGarage(token);
    const { sales, loading: salesLoading } = useSales(token);

    if (!user) return null;

    const renderVehicleCard = (v: any) => (
        <motion.div
            layout
            key={v.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
        >
            <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden mb-4">
                {v.images?.[0] ? (
                    <img src={v.images[0]} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Car size={32} strokeWidth={1.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-slate-400">No Image</span>
                    </div>
                )}
                {v.active_auction_status && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center shadow-lg shadow-emerald-500/20">
                            <Activity size={10} className="mr-1.5 animate-pulse" />
                            {v.active_auction_status}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Link href={`/vehicles/${v.id}`} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                        Inspect Asset
                    </Link>
                </div>
            </div>

            <div className="px-1">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg tracking-tight leading-tight group-hover:text-burgundy transition-colors">{v.make} {v.model}</h3>
                        <div className="flex items-center mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{v.year}</span>
                            <span className="mx-2 text-slate-200">|</span>
                            <span>{v.vin?.substring(0, 8)}...</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-burgundy/5 transition-colors">
                        <ShieldCheck size={18} className="text-emerald-500" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Market Value</span>
                        <span className="text-sm font-heading font-extrabold text-slate-900">₦{(v.price || 0).toLocaleString()}</span>
                    </div>
                    <Link href={`/dashboard/garage/services/diagnostics?id=${v.id}`} className="p-2.5 bg-slate-50 hover:bg-burgundy hover:text-white text-slate-400 rounded-xl transition-all active:scale-95 shadow-sm">
                        <Wrench size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );

    const renderSaleCard = (s: any) => (
        <motion.div
            layout
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden mb-4">
                {s.images?.[0] ? (
                    <img src={s.images[0]} alt={`${s.make} ${s.model}`} className="w-full h-full object-cover transition-all duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Car size={32} strokeWidth={1.5} />
                    </div>
                )}
                <div className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center shadow-lg">
                    <ShoppingBag size={12} className="mr-1.5 text-burgundy" />
                    {s.type === 'escrow' ? 'Escrow Lock' : 'Live Auction'}
                </div>
            </div>

            <div className="px-1">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-burgundy transition-colors">{s.make} {s.model}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {s.type === 'escrow' ? `Buyer: ${s.counterpart_name}` : 'Platform Listing'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-heading font-extrabold text-burgundy">₦{(s.price || 0).toLocaleString()}</div>
                        <div className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-full">
                            {s.stage?.replace('_', ' ') || 'Active'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                        <Clock size={12} className="mr-1.5" />
                        {new Date(s.updated_at).toLocaleDateString()}
                    </span>
                    <Link href={s.type === 'escrow' ? `/dashboard/escrow/${s.id}` : `/auctions/${s.id}`} className="text-[10px] font-black text-burgundy uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform">
                        Manage <ChevronRight size={14} className="ml-0.5" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24 relative min-h-[80vh]">
            <MotionBackground />

            {/* Premium Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 px-4 py-8">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-burgundy/5 text-burgundy px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                        <Warehouse size={14} />
                        <span>Asset Management</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-none italic">The Garage.</h1>
                    <p className="text-sm md:text-base font-subheading font-medium text-slate-500 mt-4 max-w-lg">
                        Securely manage your vehicle portfolio, deploy maintenance protocols, and track asset appreciation.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/market" className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-900 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 leading-none">
                        <Search size={16} className="text-slate-400" />
                        <span>Discover</span>
                    </Link>
                    <Link href="/valuation/wizard" className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-burgundy text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-burgundy-light transition-all shadow-xl shadow-burgundy/20 active:scale-95 leading-none">
                        <Plus size={16} />
                        <span>Register Asset</span>
                    </Link>
                </div>
            </div>

            {/* Professional Sticky Nav */}
            <div className="sticky top-4 z-40 px-4">
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl p-1.5 rounded-[2rem] flex space-x-1 border border-slate-200/50 shadow-2xl shadow-slate-200/30">
                    {[
                        { id: 'vault', label: 'Vault', icon: Warehouse },
                        { id: 'workshop', label: 'Services', icon: Wrench },
                        { id: 'sales', label: 'Market', icon: Tag }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 md:py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-burgundy text-white shadow-xl shadow-burgundy/20 scale-105 z-10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={16} />
                            <span className="hidden xs:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="px-4 pt-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'vault' && (
                        <motion.div
                            key="vault"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Your Portfolio ({vehicles.length})</h2>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-lg transition-all"><Filter size={16} /></button>
                                </div>
                            </div>

                            {garageLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="bg-slate-50 h-[320px] rounded-3xl animate-pulse" />)}
                                </div>
                            ) : vehicles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {vehicles.map(renderVehicleCard)}
                                </div>
                            ) : (
                                <div className="glass-card bg-white/40 border border-slate-100 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center min-h-[400px] text-center">
                                    <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform">
                                        <Car size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-heading font-extrabold text-slate-900 mb-3 tracking-tight">Your Vault is Empty</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                                        You haven't acquired any assets yet. Browse the marketplace or register a vehicle to begin your collection.
                                    </p>
                                    <Link href="/dashboard/market" className="inline-flex items-center space-x-3 bg-burgundy/10 text-burgundy px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-burgundy hover:text-white transition-all active:scale-95 shadow-lg shadow-burgundy/5">
                                        <span>Browse Market</span>
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'workshop' && (
                        <motion.div
                            key="workshop"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="max-w-4xl mx-auto space-y-12">
                                <div className="text-center space-y-4 mb-20">
                                    <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight italic">Protocol Deployment.</h2>
                                    <p className="text-slate-500 font-medium max-w-md mx-auto">
                                        Select a specialized concierge service hub to initiate interventions or regulatory compliance.
                                    </p>
                                </div>
                                <WorkshopHubs />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'sales' && (
                        <motion.div
                            key="sales"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Active Listings ({sales.length})</h2>
                            </div>

                            {salesLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="bg-slate-50 h-[320px] rounded-3xl animate-pulse" />)}
                                </div>
                            ) : sales.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sales.map(renderSaleCard)}
                                </div>
                            ) : (
                                <div className="glass-card bg-white/40 border border-slate-100 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center min-h-[400px] text-center">
                                    <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-8 -rotate-6">
                                        <Tag size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-heading font-extrabold text-slate-900 mb-3 tracking-tight">No Active Sales</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                                        You are not currently liquidating any assets. List a vehicle for sale or auction to track its progress.
                                    </p>
                                    <Link href="/valuation/wizard" className="inline-flex items-center space-x-3 bg-burgundy/10 text-burgundy px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-burgundy hover:text-white transition-all active:scale-95 shadow-lg shadow-burgundy/5">
                                        <span>Liquidate Asset</span>
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
