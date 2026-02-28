'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Warehouse,
    Plus,
    Car,
    Activity,
    Tag,
    Wrench,
    ShieldCheck,
    ChevronRight,
    Search,
    Eye,
    EyeOff,
    Info,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGarage, useSales } from '@/hooks/useGarage';
import WorkshopHubs from '@/components/garage/WorkshopHubs';
import { getAssetUrl, apiFetch, getVehicleImages } from '@/lib/api';

export default function GaragePage() {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'vault' | 'services' | 'sales'>('vault');

    const { vehicles, loading: garageLoading, refetch } = useGarage(token);
    const { sales, loading: salesLoading } = useSales(token);

    if (!user) return null;

    const togglePrivacy = async (id: string, current: boolean) => {
        try {
            await apiFetch(`/vehicles/${id}/privacy`, {
                token,
                method: 'PATCH',
                body: { is_private: !current }
            });
            refetch();
        } catch (err: any) {
            console.error('Privacy update failed', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            {/* Immersive Header */}
            <div className="relative h-48 md:h-64 rounded-[3rem] overflow-hidden bg-onyx shadow-2xl shadow-onyx/30">
                <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/80 to-transparent z-10" />
                <div className="absolute top-0 right-0 w-full h-full opacity-30 z-0">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-burgundy/40 via-transparent to-transparent" />
                </div>

                <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-12">
                    <div className="flex items-center gap-2 text-burgundy font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                        <Warehouse size={14} />
                        <span>Asset Custody</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 italic">
                        The Garage<span className="text-burgundy">.</span>
                    </h1>
                    <p className="text-white/60 text-xs md:text-sm font-bold max-w-md uppercase tracking-widest leading-relaxed">
                        Precision management of your automotive portfolio and concierge protocols.
                    </p>
                </div>

                <div className="absolute bottom-6 right-8 z-30 hidden md:flex gap-3">
                    <Link href="/dashboard/market" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                        Explore Market
                    </Link>
                    <Link href="/dashboard/valuation/wizard" className="bg-burgundy hover:bg-burgundy-dark text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-burgundy/30">
                        Register Asset
                    </Link>
                </div>
            </div>

            {/* Quick Actions for Mobile */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
                <Link href="/dashboard/market" className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                    <Search size={20} className="text-burgundy" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Discover</span>
                </Link>
                <Link href="/dashboard/valuation/wizard" className="bg-burgundy p-4 rounded-[2rem] shadow-lg shadow-burgundy/20 flex flex-col items-center gap-2 text-white">
                    <Plus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Register</span>
                </Link>
            </div>

            {/* Premium Tab Navigation */}
            <div className="flex items-center justify-center">
                <nav className="flex bg-gray-100/50 p-1.5 rounded-[2.5rem] w-full max-w-lg shadow-inner">
                    {[
                        { id: 'vault', label: 'Vault', icon: Warehouse },
                        { id: 'services', label: 'Concierge', icon: Wrench },
                        { id: 'sales', label: 'Listings', icon: Tag }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-onyx shadow-xl scale-105 z-10' : 'text-gray-400 hover:text-onyx'}`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-burgundy' : ''} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'vault' && (
                        <motion.div
                            key="vault"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Portfolio Assets ({vehicles.length})</h3>
                            </div>

                            {garageLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="aspect-[16/11] bg-gray-100 rounded-[2.5rem] animate-pulse" />)}
                                </div>
                            ) : vehicles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {vehicles.map(v => (
                                        <VehicleCard
                                            key={v.id}
                                            vehicle={v}
                                            onTogglePrivacy={() => togglePrivacy(v.id, v.is_private)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Car size={48} />}
                                    title="Vault Empty"
                                    desc="You haven't added any vehicles to your custody yet."
                                    actionUrl="/dashboard/market"
                                    actionLabel="Browse Marketplace"
                                />
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'services' && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <div className="text-center max-w-xl mx-auto py-8">
                                <h2 className="text-3xl font-black text-onyx tracking-tight italic mb-4">Concierge Protocols.</h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                    Deploy specialized services to enhance the lifecycle and valuation of your assets.
                                </p>
                            </div>
                            <WorkshopHubs />
                        </motion.div>
                    )}

                    {activeTab === 'sales' && (
                        <motion.div
                            key="sales"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Liquidation Pipeline ({sales.length})</h3>
                            </div>
                            {salesLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="aspect-[16/11] bg-gray-100 rounded-[2.5rem] animate-pulse" />)}
                                </div>
                            ) : sales.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sales.map(s => <SaleCard key={s.id} sale={s} />)}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Tag size={48} />}
                                    title="No Active Sales"
                                    desc="You are not currently liquidating any of your assets."
                                    actionUrl="/valuation/wizard"
                                    actionLabel="List an Asset"
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function VehicleCard({ vehicle, onTogglePrivacy }: { vehicle: any, onTogglePrivacy: () => void }) {
    const images = getVehicleImages(vehicle.images);
    const displayImage = getAssetUrl(images[0]);

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-onyx/10 transition-all duration-500"
        >
            <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                {images.length > 0 ? (
                    <img src={displayImage} alt={vehicle.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                        <Car size={32} strokeWidth={1} />
                    </div>
                )}

                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={(e) => { e.preventDefault(); onTogglePrivacy(); }}
                        className={`p-2.5 rounded-2xl backdrop-blur-xl transition-all shadow-lg ${vehicle.is_private ? 'bg-onyx/90 text-white' : 'bg-white/90 text-onyx hover:bg-white'}`}
                    >
                        {vehicle.is_private ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {vehicle.active_auction_status && (
                    <div className="absolute top-4 left-4">
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center shadow-lg">
                            <Activity size={10} className="mr-1.5 animate-pulse" />
                            {vehicle.active_auction_status}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <Link href={`/vehicles/${vehicle.id}`} className="w-full bg-white text-onyx py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center justify-center gap-2">
                        Inspect Asset <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-lg font-black text-onyx truncate mb-1">{vehicle.make} {vehicle.model}</h4>
                        <div className="p-1 px-2 bg-gray-50 rounded-lg inline-flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {vehicle.year} • {vehicle.condition?.replace('_', ' ')}
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                        <ShieldCheck size={20} />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Valuation</span>
                        <span className="text-md font-black text-onyx">₦{(vehicle.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/dashboard/garage/services/diagnostics?id=${vehicle.id}`} className="w-12 h-12 bg-gray-50 hover:bg-burgundy text-gray-400 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-transparent shadow-sm">
                            <Wrench size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SaleCard({ sale }: { sale: any }) {
    const images = Array.isArray(sale.images) ? sale.images : (typeof sale.images === 'string' ? JSON.parse(sale.images) : []);
    const displayImage = getAssetUrl(images[0]);

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm p-4 group">
            <div className="relative aspect-[16/10] bg-gray-50 rounded-[2rem] overflow-hidden mb-4">
                {images.length > 0 ? (
                    <img src={displayImage} alt={sale.model} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <Car size={32} strokeWidth={1} />
                    </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-onyx/80 backdrop-blur-md p-3 rounded-2xl text-white flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest">{sale.type}</span>
                    <span className="text-[10px] font-black tracking-tight">₦{sale.price?.toLocaleString()}</span>
                </div>
            </div>

            <div className="px-2 pb-2">
                <div className="flex justify-between items-center mb-3">
                    <h5 className="font-black text-onyx truncate text-sm">{sale.make} {sale.model}</h5>
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${sale.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-burgundy/5 text-burgundy'}`}>
                        {sale.stage?.replace('_', ' ')}
                    </span>
                </div>

                <Link
                    href={sale.type === 'escrow' ? `/dashboard/escrow/${sale.id}` : `/auctions/${sale.id}`}
                    className="w-full py-3 bg-gray-50 hover:bg-onyx hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
                >
                    Manage Protocol <ChevronRight size={14} />
                </Link>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, desc, actionUrl, actionLabel }: any) {
    return (
        <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[3rem] p-12 py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-[2rem] flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-onyx tracking-tighter mb-2 italic">{title}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8 max-w-xs leading-relaxed">{desc}</p>
            <Link href={actionUrl} className="bg-burgundy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-burgundy/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                {actionLabel} <ChevronRight size={16} />
            </Link>
        </div>
    );
}
