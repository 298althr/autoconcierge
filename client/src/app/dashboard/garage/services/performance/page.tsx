'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Zap,
    Calculator,
    Leaf,
    ShieldAlert,
    Snowflake,
    ChevronRight,
    ArrowUpRight,
    Wrench,
    Smartphone,
    TrendingDown,
    MapPin,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PremiumButton from '@/components/ui/PremiumButton';
import PillHeader from '@/components/landing/PillHeader';
import MotionBackground from '@/components/landing/MotionBackground';

const upgrades = [
    {
        id: 'cng-conversion',
        title: 'CNG Conversion',
        description: 'Reduce fuel costs by up to 70% with Italian sequential injection kits.',
        icon: Leaf,
        status: '70% Fuel Reduction',
        price: 750000,
        type: 'ECO'
    },
    {
        id: 'security-tech',
        title: 'Security & Android',
        description: 'Biometric immobilizers, GPS tracking, and 12-inch 4K Android interfaces.',
        icon: Smartphone,
        status: 'High Demand',
        price: 150000,
        type: 'TECH'
    },
    {
        id: 'ac-servicing',
        title: 'ICE Cold AC Revive',
        description: 'Complete gas recharge, filter sterilization, and leak detection.',
        icon: Snowflake,
        status: 'Ready in 2h',
        price: 35000,
        type: 'COMFORT'
    }
];

export default function PerformanceHub() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [tankSize, setTankSize] = useState('75L');

    useEffect(() => {
        if (token) {
            apiFetch('/me/garage', { token })
                .then((res: any) => {
                    setVehicles(res.data || []);
                    setLoading(false);
                })
                .catch((err: any) => {
                    console.error('Error fetching vehicles:', err);
                    setLoading(false);
                });
        }
    }, [token]);

    const cngPrices: Record<string, number> = {
        '65L': 680000,
        '75L': 750000,
        '100L': 920000
    };

    const calculateROI = () => {
        const base = cngPrices[tankSize];
        const labor = 25000;
        return { base, labor, total: base + labor };
    };

    const roiResult = calculateROI();

    return (
        <main className="relative min-h-screen selection:bg-burgundy selection:text-white bg-[#F8FAFC] overflow-x-hidden pt-32 pb-20 px-6">
            <MotionBackground />
            <PillHeader />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12">
                    <Link
                        href="/dashboard/garage"
                        className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] mb-4 transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Workshop</span>
                    </Link>
                    <div className="flex items-center space-x-3 text-yellow-500 font-black uppercase tracking-widest text-[10px] mb-3">
                        <Zap size={16} />
                        <span>Next-Gen Systems</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Performance Hub.</h1>
                    <p className="text-slate-500 font-subheading text-sm mt-3 leading-relaxed">
                        Optimize fuel efficiency, upgrade onboard technology, and revive mechanical subsystems.
                    </p>
                </header>

                {/* Step 1: Vehicle Selection */}
                {!selectedVehicle && (
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Optimize Asset</h2>
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <span className="animate-spin text-yellow-500"><Zap size={32} /></span>
                            </div>
                        ) : vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map((v) => (
                                    <motion.div
                                        key={v.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedVehicle(v)}
                                        className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-yellow-500/30 transition-all border border-slate-100"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                            <img src={v.images?.[0]} className="w-full h-full object-cover" alt={v.model} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-sm">{v.year} {v.make} {v.model}</h3>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{v.license_plate || 'No Plate'}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/60 p-12 rounded-[2.5rem] border border-slate-100 text-center">
                                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium italic">No assets registered for optimization.</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Step 2: Performance Options */}
                <AnimatePresence>
                    {selectedVehicle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* ROI Calculator Shortcut */}
                            <motion.div
                                onClick={() => setIsCalcOpen(true)}
                                whileHover={{ scale: 1.01 }}
                                className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between group cursor-pointer shadow-xl shadow-yellow-500/20"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Calculator size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-heading font-extrabold italic tracking-tight">CNG ROI Engine.</h3>
                                        <p className="text-white/80 text-sm font-medium">Calculate fuel savings & tank size ROI.</p>
                                    </div>
                                </div>
                                <div className="bg-white/20 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md group-hover:bg-white/30 transition-all">
                                    Analyze Savings
                                </div>
                            </motion.div>

                            {/* Upgrades Grid */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">Optimization Protocols</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {upgrades.map((u) => (
                                        <motion.div
                                            key={u.id}
                                            whileHover={{ x: 10 }}
                                            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer border-slate-100 hover:border-yellow-500/30 transition-all shadow-sm"
                                        >
                                            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                                                <u.icon size={28} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                                                    <h4 className="text-lg font-heading font-extrabold text-slate-900 uppercase tracking-widest leading-none">{u.title}</h4>
                                                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-yellow-100 rounded text-yellow-700">{u.type}</span>
                                                </div>
                                                <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic">{u.description}</p>
                                                <p className="text-[9px] text-yellow-600 font-bold uppercase tracking-widest mt-2">{u.status}</p>
                                            </div>
                                            <div className="text-center md:text-right shrink-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Package Entry</p>
                                                <p className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
                                                    ₦{u.price.toLocaleString()}
                                                </p>
                                                <div className="mt-3 flex items-center justify-center md:justify-end text-[9px] font-black uppercase tracking-widest text-yellow-600 group-hover:gap-2 transition-all">
                                                    Deploy <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Calculator Modal */}
            <AnimatePresence>
                {isCalcOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCalcOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-2xl bg-white rounded-t-[3.5rem] p-10 pb-16 z-10 border-t border-slate-200"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />

                            <h2 className="text-3xl font-heading font-extrabold text-slate-900 italic tracking-tight mb-2">CNG ROI Analysis.</h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-10">Select Tank Capacity for optimized fuel delivery.</p>

                            <div className="space-y-8">
                                <div className="grid grid-cols-3 gap-4">
                                    {['65L', '75L', '100L'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setTankSize(size)}
                                            className={`py-6 rounded-3xl border transition-all flex flex-col items-center gap-2 ${tankSize === size ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <span className="text-xl font-heading font-extrabold">{size}</span>
                                            <span className="text-[8px] font-black uppercase">Capacity</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-emerald-600 mb-1">Fuel Economy Projection</p>
                                        <h4 className="text-3xl font-heading font-extrabold text-slate-900 italic">70% SAVINGS.</h4>
                                    </div>
                                    <div className="text-right">
                                        <TrendingDown className="text-emerald-500 inline-block mb-1" size={24} />
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">4.5 Mo. Payback</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Sequential Kit & Tank</span>
                                        <span className="text-slate-900 tracking-tight">₦{roiResult.base.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-yellow-600">
                                        <span>Calibration & Setup</span>
                                        <span className="tracking-tight">₦{roiResult.labor.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Deployment</span>
                                        <span className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight italic">₦{roiResult.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href="/checkout/performance" className="w-full">
                                    <PremiumButton className="w-full" icon={ArrowUpRight} tooltip="Secure Slot">
                                        Initiate Installation
                                    </PremiumButton>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
