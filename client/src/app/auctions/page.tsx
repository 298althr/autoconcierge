'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import VehicleCard from '@/components/VehicleCard';
import { Search, Gavel, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { useAuth } from '@/context/AuthContext';

export default function AuctionsPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAuctions();
    }, []);

    async function fetchAuctions() {
        setLoading(true);
        setError('');
        try {
            // Fetch vehicles that are in auction
            const response = await apiFetch(`/vehicles?status=in_auction${search ? `&search=${search}` : ''}`);
            setVehicles(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch auctions');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={`relative min-h-screen bg-[#F8FAFC] selection:bg-burgundy selection:text-white pb-32`}>
            <MotionBackground />
            {user ? <DashboardNavbar /> : <PillHeader />}

            <div className={`max-w-7xl mx-auto px-6 relative z-10 ${user ? 'pt-24' : 'pt-96'}`}>
                {/* Hero / Header */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-burgundy/10 text-burgundy text-[10px] font-black uppercase tracking-widest rounded-full border border-burgundy/10 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse" />
                                    Live Auctions
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tighter text-slate-900 leading-[0.9] italic">
                                Institutional <br /> <span className="text-slate-400">Inventory.</span>
                            </h1>
                            <p className="mt-6 text-slate-500 max-w-md font-subheading text-lg">
                                Real-time bidding on forensic-certified assets from institutional liquidations and private collections.
                            </p>
                        </div>

                        <div className="bg-white p-2 rounded-full border border-slate-100 shadow-xl shadow-slate-900/5 flex items-center md:min-w-[400px]">
                            <div className="pl-6 text-slate-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search live catalog..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAuctions()}
                                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-900 font-body text-sm"
                            />
                            <PremiumButton onClick={fetchAuctions} className="!py-3">
                                Search
                            </PremiumButton>
                        </div>
                    </motion.div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center gap-6 mb-12 overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metric Dashboard:</span>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <Gavel size={14} className="text-burgundy" />
                                <span className="text-xs font-bold text-slate-900">{vehicles.length} Live Items</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <Clock size={14} className="text-emerald-500" />
                                <span className="text-xs font-bold text-slate-900">24/7 Liquidity</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <Sparkles size={14} className="text-amber-500" />
                                <span className="text-xs font-bold text-slate-900">Certified Audits</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : vehicles.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {vehicles.map((v: any) => (
                            <VehicleCard key={v.id} vehicle={v} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Gavel size={40} />
                        </div>
                        <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-2">No Active Auctions</h2>
                        <p className="text-slate-500 font-subheading mb-8">The current auction block is clear. Check back shortly for new institutional inventory.</p>
                        <PremiumButton onClick={() => window.location.href = '/vehicles'}>
                            Browse Marketplace
                        </PremiumButton>
                    </div>
                )}
            </div>
        </main>
    );
}
