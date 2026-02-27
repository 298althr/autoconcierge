'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';
import {
    Car,
    Gavel,
    ArrowUpRight,
    Clock,
    ShieldCheck,
    MapPin,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import RegisterVehicleHero from '@/components/vehicle/RegisterVehicleHero';

export default function GaragePage() {
    const { token } = useAuth();
    const [view, setView] = useState<'garage' | 'sales'>('garage');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            if (view === 'garage') {
                const res = await apiFetch('/me/garage', { token });
                setVehicles(res.data);
            } else {
                const res = await apiFetch('/me/sales', { token });
                setSales(res.data);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, view]);

    const handleSettle = async (auctionId: string) => {
        setActionLoading(auctionId);
        try {
            await apiFetch(`/me/settle/${auctionId}`, {
                method: 'POST',
                token
            });
            await fetchData();
        } catch (err: any) {
            alert(err.message || 'Failed to settle. Ensure sufficient collateral/balance.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAcceptDeal = async (escrowId: string) => {
        setActionLoading(escrowId);
        try {
            await apiFetch(`/escrow/${escrowId}/accept`, {
                method: 'POST',
                token
            });
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (isRegistering) {
        return (
            <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20 px-6">
                <MotionBackground />
                <PillHeader />
                <div className="max-w-6xl mx-auto relative z-10">
                    <header className="mb-12 flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => setIsRegistering(false)}
                                className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] mb-3 transition-colors"
                            >
                                <ChevronLeft size={16} />
                                <span>Return to Vault</span>
                            </button>
                            <h1 className="text-4xl font-heading font-extrabold text-slate-900 tracking-tight">Onboard Asset.</h1>
                        </div>
                    </header>
                    <RegisterVehicleHero onSuccess={() => {
                        setIsRegistering(false);
                        fetchData();
                    }} />
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20 px-6">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center space-x-2 text-burgundy font-bold uppercase tracking-widest text-[10px] mb-3">
                            <Car size={16} />
                            <span>Private Collection</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">The Garage.</h1>
                        <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">Oversee acquired assets and finalize custody transfers.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-4"
                    >
                        <PremiumButton
                            variant="secondary"
                            size="sm"
                            icon={Plus}
                            onClick={() => setIsRegistering(true)}
                        >
                            Register Asset
                        </PremiumButton>

                        <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-slate-200">
                            <button
                                onClick={() => setView('garage')}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'garage' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Vault
                            </button>
                            <button
                                onClick={() => setView('sales')}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'sales' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Sales
                            </button>
                            <Link href="/bids" className="px-6 py-2.5 text-slate-500 hover:text-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors">Active Bids</Link>
                        </div>
                    </motion.div>
                </header>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-600 text-xs font-bold font-subheading">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {loading ? (
                    <div className="py-32 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-900/5 text-slate-900 rounded-full flex items-center justify-center animate-pulse mb-6">
                            <Car size={24} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Accessing Vault...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence mode="popLayout">
                            {(view === 'garage' ? vehicles : sales).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="glass-card p-6 md:p-8 flex flex-col group overflow-hidden relative"
                                >
                                    {/* Status Bar */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${item.stage === 'completed' || item.status === 'settled' ? 'bg-emerald-500' :
                                            item.stage === 'waiting_seller_acceptance' ? 'bg-orange-400' : 'bg-slate-200'
                                        }`} />

                                    <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                                        <div className="w-full sm:w-48 h-48 bg-slate-100 rounded-[2rem] overflow-hidden relative shrink-0 shadow-inner">
                                            <img
                                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                                                alt={item.model}
                                            />
                                            {(item.stage === 'completed' || item.status === 'settled') && (
                                                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                                    <div className="bg-white p-3 rounded-full shadow-xl">
                                                        <ShieldCheck className="text-emerald-500" size={24} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col py-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-heading font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">{item.year} {item.make} {item.model}</h3>
                                                    <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                        <MapPin size={12} className="text-burgundy" />
                                                        <span>{view === 'garage' ? (item.location || 'Escrow Facility') : `Buyer: ${item.buyer_name || 'Verified Buyer'}`}</span>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm border ${(item.stage === 'completed' || item.status === 'settled') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                    }`}>
                                                    {view === 'garage' ? (item.status === 'settled' ? 'Transferred' : 'Allocated') : (item.stage === 'completed' ? 'Sold' : 'Pending Deal')}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 flex items-end justify-between border-t border-slate-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                                        {view === 'garage' ? 'Acquisition Value' : 'Sale Value'}
                                                    </p>
                                                    <p className="text-2xl font-heading font-extrabold text-slate-900">
                                                        ₦{(parseFloat(item.total_deal_amount || item.current_price || 0)).toLocaleString()}
                                                    </p>
                                                </div>

                                                {view === 'garage' ? (
                                                    item.status === 'ended' ? (
                                                        <PremiumButton
                                                            onClick={() => handleSettle(item.id)}
                                                            isLoading={actionLoading === item.id}
                                                            disabled={!!actionLoading}
                                                            icon={ArrowUpRight}
                                                            tooltip="Finalize Escrow Transfer"
                                                        >
                                                            Complete Settlement
                                                        </PremiumButton>
                                                    ) : (
                                                        <Link href={`/vehicles/${item.vehicle_id}`}>
                                                            <PremiumButton variant="outline" size="sm" tooltip="View Profile">
                                                                Dossier
                                                            </PremiumButton>
                                                        </Link>
                                                    )
                                                ) : (
                                                    item.stage === 'waiting_seller_acceptance' ? (
                                                        <PremiumButton
                                                            onClick={() => handleAcceptDeal(item.id)}
                                                            isLoading={actionLoading === item.id}
                                                            disabled={!!actionLoading}
                                                            variant="secondary"
                                                            icon={ShieldCheck}
                                                        >
                                                            Accept Deal
                                                        </PremiumButton>
                                                    ) : (
                                                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                                            <ShieldCheck size={14} /> Transferred
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {item.stage === 'waiting_seller_acceptance' && (
                                        <div className="mt-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex items-start space-x-3 text-[10px] font-medium text-orange-700 leading-relaxed">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-orange-400" />
                                            <span><strong>Buy Now Proposal:</strong> A buyer has committed the 10% collateral. Review and accept the deal to proceed with full escrow funding.</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {((view === 'garage' && vehicles.length === 0) || (view === 'sales' && sales.length === 0)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="col-span-full py-32 text-center bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white shadow-xl"
                            >
                                <div className="w-24 h-24 bg-slate-900/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                                    <Gavel size={40} />
                                </div>
                                <h3 className="text-3xl font-heading font-extrabold text-slate-900 mb-3 tracking-tight">
                                    {view === 'garage' ? 'Vault Empty.' : 'No active sales.'}
                                </h3>
                                <p className="text-slate-500 max-w-sm mx-auto text-sm font-subheading mb-10 leading-relaxed">
                                    {view === 'garage' ? 'Participate in live market segments to acquire assets, or register your own vehicle for the platform collection.' : 'Your active sales and pending escrow deals will appear here once buyers initiate a purchase.'}
                                </p>
                                {view === 'garage' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Link href="/vehicles">
                                            <PremiumButton icon={Gavel} tooltip="Enter Marketplace">
                                                Explore Live Markets
                                            </PremiumButton>
                                        </Link>
                                        <PremiumButton variant="outline" icon={Plus} onClick={() => setIsRegistering(true)}>
                                            Register My Vehicle
                                        </PremiumButton>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
